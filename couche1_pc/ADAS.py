"""
ADAS — Advanced Driver Assistance System
Alpha Technology — PFE 2024-2025
CAM USB (index=1)

Détecte :
  LDW : Lane Departure Warning (Hough Lines)
  FCW : Forward Collision Warning (YOLOv8n monoculaire)

MODIFICATIONS vs original :
  → run_adas(stop_event, cam_index) reçoit l'index caméra
  → duree_secondes calculée par FcwTracker + LdwTracker
  → Seuls les événements >= 2.0s sont envoyés à Shared
"""

import cv2
import numpy as np
import threading
import time
import collections
from Shared import init_db, log_event_to_db

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("[ADAS][WARN] ultralytics non installé — FCW désactivé.")

# ══════════════════════════════════════════════════════════════════════════
# CONFIG
# ══════════════════════════════════════════════════════════════════════════

YOLO_MODEL = "yolov8n.pt"
DISPLAY    = True
FPS        = 30
SIM_LOOP   = True
SIM_SPEED  = 1.0

# ── FCW ───────────────────────────────────────────────────────────────────
VEHICLE_REAL_HEIGHT_M = 1.5
FOCAL_LENGTH_PX       = 600
FCW_WARNING_M         = 15.0
FCW_DANGER_M          = 7.0
VEHICLE_CLASSES       = {2, 3, 5, 7}

# ── LDW ───────────────────────────────────────────────────────────────────
ROI_TOP_Y           = 0.55
ROI_BOTTOM_Y        = 0.95
ROI_TOP_W           = 0.30
ROI_BOTTOM_W        = 0.50
LANE_CENTER_HISTORY = 10
DRIFT_THRESHOLD     = 0.08
DRIFT_SPEED_LIMIT   = 0.015
LDW_CONSEC_FRAMES   = 8

# ── Cooldowns ─────────────────────────────────────────────────────────────
COOLDOWN = {
    "LDW_LEFT"   : 8,
    "LDW_RIGHT"  : 8,
    "FCW_WARNING": 10,
    "FCW_DANGER" : 5,
}


# ══════════════════════════════════════════════════════════════════════════
# YOLO WORKER ADAS
# ══════════════════════════════════════════════════════════════════════════

class AdasYoloWorker:

    def __init__(self):
        self._frame     = None
        self._lock      = threading.Lock()
        self._running   = False
        self.detections = []

    def start(self):
        if not YOLO_AVAILABLE:
            return
        self._model   = YOLO(YOLO_MODEL)
        self._running = True
        threading.Thread(target=self._loop, daemon=True,
                         name="ADAS-YOLO").start()
        print("[ADAS] YOLO worker démarré.")

    def submit(self, frame):
        with self._lock:
            self._frame = frame.copy()

    def _loop(self):
        while self._running:
            with self._lock:
                frame = self._frame
            if frame is None:
                time.sleep(0.05)
                continue
            small   = cv2.resize(frame, (320, 240))
            results = self._model(small, verbose=False, conf=0.40)[0]
            dets    = []
            if results.boxes:
                sx = frame.shape[1] / 320
                sy = frame.shape[0] / 240
                for b in results.boxes:
                    cls = int(b.cls)
                    if cls not in VEHICLE_CLASSES:
                        continue
                    x1, y1, x2, y2 = b.xyxy[0].tolist()
                    dets.append((cls, x1*sx, y1*sy,
                                 x2*sx, y2*sy, float(b.conf)))
            self.detections = dets
            time.sleep(0.1)

    def stop(self):
        self._running = False


# ══════════════════════════════════════════════════════════════════════════
# FCW — avec durée réelle
# ══════════════════════════════════════════════════════════════════════════

def estimate_distance_m(pixel_height: float) -> float:
    if pixel_height < 1:
        return 9999.0
    return (VEHICLE_REAL_HEIGHT_M * FOCAL_LENGTH_PX) / pixel_height


def closest_vehicle_distance(detections, frame_w, frame_h):
    min_dist = 9999.0
    best_box = None
    cx_lo    = frame_w * 0.30
    cx_hi    = frame_w * 0.70
    for cls, x1, y1, x2, y2, conf in detections:
        cx = (x1 + x2) / 2
        if not (cx_lo < cx < cx_hi):
            continue
        d = estimate_distance_m(y2 - y1)
        if d < min_dist:
            min_dist = d
            best_box = (int(x1), int(y1), int(x2), int(y2))
    return min_dist, best_box


class FcwTracker:
    """FCW avec mesure durée réelle."""

    def __init__(self):
        self._last   = {"FCW_WARNING": 0.0, "FCW_DANGER": 0.0}
        self._warn_n = 0
        self._dan_n  = 0
        self._CONSEC = {"FCW_WARNING": 6, "FCW_DANGER": 4}
        self._warn_start: float = None
        self._dan_start:  float = None

    def update(self, distance_m: float):
        warn_fired = danger_fired = False
        now        = time.time()

        if distance_m < FCW_DANGER_M:
            self._dan_n  += 1
            self._warn_n  = 0
            self._warn_start = None
            if self._dan_start is None:
                self._dan_start = now
        elif distance_m < FCW_WARNING_M:
            self._warn_n += 1
            self._dan_n   = 0
            self._dan_start = None
            if self._warn_start is None:
                self._warn_start = now
        else:
            self._warn_n = self._dan_n = 0
            self._warn_start = self._dan_start = None

        if (self._dan_n >= self._CONSEC["FCW_DANGER"]
                and now - self._last["FCW_DANGER"] > COOLDOWN["FCW_DANGER"]):
            duree = (now - self._dan_start) if self._dan_start else 2.0
            duree = max(duree, 2.0)
            danger_fired             = True
            self._last["FCW_DANGER"] = now
            self._dan_n              = 0
            self._dan_start          = None
            log_event_to_db("FCW_DANGER", duree_secondes=round(duree, 2))

        elif (self._warn_n >= self._CONSEC["FCW_WARNING"]
                and now - self._last["FCW_WARNING"] > COOLDOWN["FCW_WARNING"]):
            duree = (now - self._warn_start) if self._warn_start else 2.0
            duree = max(duree, 2.0)
            warn_fired                = True
            self._last["FCW_WARNING"] = now
            self._warn_n              = 0
            self._warn_start          = None
            log_event_to_db("FCW_WARNING", duree_secondes=round(duree, 2))

        return warn_fired, danger_fired


# ══════════════════════════════════════════════════════════════════════════
# LDW — avec durée réelle
# ══════════════════════════════════════════════════════════════════════════

def build_roi_mask(frame):
    h, w  = frame.shape[:2]
    top_y = int(h * ROI_TOP_Y)
    bot_y = int(h * ROI_BOTTOM_Y)
    tw    = int(w * ROI_TOP_W)
    bw    = int(w * ROI_BOTTOM_W)
    cx    = w // 2
    pts   = np.array([[
        (cx-bw, bot_y), (cx+bw, bot_y),
        (cx+tw, top_y), (cx-tw, top_y),
    ]], dtype=np.int32)
    mask  = np.zeros(frame.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, pts, 255)
    return mask, pts


def detect_lanes(frame):
    h, w   = frame.shape[:2]
    gray   = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur   = cv2.GaussianBlur(gray, (5, 5), 0)
    edges  = cv2.Canny(blur, 40, 120)
    mask, roi_pts = build_roi_mask(frame)
    masked = cv2.bitwise_and(edges, edges, mask=mask)

    lines = cv2.HoughLinesP(masked, 1, np.pi/180,
                             threshold=40, minLineLength=40, maxLineGap=80)
    left_lines, right_lines = [], []
    cx = w / 2

    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if x2 == x1:
                continue
            slope = (y2 - y1) / (x2 - x1)
            if abs(slope) < 0.3:
                continue
            if slope < 0 and x1 < cx and x2 < cx:
                left_lines.append(line[0])
            elif slope > 0 and x1 > cx and x2 > cx:
                right_lines.append(line[0])

    bot_y = int(h * ROI_BOTTOM_Y)

    def extrapolate_x(grp, at_y):
        if not grp:
            return None
        xs, ys = [], []
        for x1, y1, x2, y2 in grp:
            xs += [x1, x2]
            ys += [y1, y2]
        if len(set(ys)) < 2:
            return None
        return int(np.polyval(np.polyfit(ys, xs, 1), at_y))

    return (extrapolate_x(left_lines, bot_y),
            extrapolate_x(right_lines, bot_y),
            masked, roi_pts)


class LdwTracker:
    """LDW avec mesure durée réelle."""

    def __init__(self):
        self._history       = collections.deque(maxlen=LANE_CENTER_HISTORY)
        self._drift_left_n  = 0
        self._drift_right_n = 0
        self._last          = {"LDW_LEFT": 0.0, "LDW_RIGHT": 0.0}
        self._left_start:  float = None
        self._right_start: float = None

    def update(self, left_x, right_x, frame_w):
        ldw_left = ldw_right = False
        if left_x is None or right_x is None:
            self._drift_left_n = self._drift_right_n = 0
            self._left_start   = self._right_start   = None
            return ldw_left, ldw_right, None, None

        self._history.append((left_x + right_x) / 2.0)
        if len(self._history) < 4:
            return ldw_left, ldw_right, int(self._history[-1]), None

        smoothed    = np.mean(self._history)
        offset      = (smoothed - frame_w / 2.0) / frame_w
        drift_speed = (abs(self._history[-1] - self._history[-2]) / frame_w
                       if len(self._history) >= 2 else 0.0)
        departure   = None
        now         = time.time()

        if offset < -DRIFT_THRESHOLD and drift_speed < DRIFT_SPEED_LIMIT:
            self._drift_left_n  += 1
            self._drift_right_n  = 0
            self._right_start    = None
            departure            = "LEFT"
            if self._left_start is None:
                self._left_start = now
        elif offset > DRIFT_THRESHOLD and drift_speed < DRIFT_SPEED_LIMIT:
            self._drift_right_n += 1
            self._drift_left_n   = 0
            self._left_start     = None
            departure            = "RIGHT"
            if self._right_start is None:
                self._right_start = now
        else:
            self._drift_left_n  = self._drift_right_n = 0
            self._left_start    = self._right_start   = None

        if (self._drift_left_n >= LDW_CONSEC_FRAMES
                and now - self._last["LDW_LEFT"] > COOLDOWN["LDW_LEFT"]):
            duree = (now - self._left_start) if self._left_start else 2.0
            duree = max(duree, 2.0)
            ldw_left               = True
            self._last["LDW_LEFT"] = now
            self._drift_left_n     = 0
            self._left_start       = None
            log_event_to_db("LDW_LEFT", duree_secondes=round(duree, 2))

        if (self._drift_right_n >= LDW_CONSEC_FRAMES
                and now - self._last["LDW_RIGHT"] > COOLDOWN["LDW_RIGHT"]):
            duree = (now - self._right_start) if self._right_start else 2.0
            duree = max(duree, 2.0)
            ldw_right               = True
            self._last["LDW_RIGHT"] = now
            self._drift_right_n     = 0
            self._right_start       = None
            log_event_to_db("LDW_RIGHT", duree_secondes=round(duree, 2))

        return ldw_left, ldw_right, int(smoothed), departure


# ══════════════════════════════════════════════════════════════════════════
# DISPLAY HELPERS
# ══════════════════════════════════════════════════════════════════════════

def draw_alert(frame, text, y, color=(0, 0, 255)):
    cv2.putText(frame, text, (20, y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 2, cv2.LINE_AA)


def draw_lane_overlay(frame, left_x, right_x, lane_center, roi_pts, departure):
    h, w   = frame.shape[:2]
    top_y  = int(h * ROI_TOP_Y)
    bot_y  = int(h * ROI_BOTTOM_Y)
    cv2.polylines(frame, roi_pts, True, (80, 80, 80), 1)
    color = (0, 100, 255) if departure else (0, 200, 80)
    if left_x is not None:
        cv2.line(frame, (left_x, bot_y), (left_x-40, top_y), color, 3)
    if right_x is not None:
        cv2.line(frame, (right_x, bot_y), (right_x+40, top_y), color, 3)
    if lane_center is not None:
        cv2.circle(frame, (lane_center, bot_y-10), 6, color, -1)
        cv2.circle(frame, (w//2, bot_y-10), 6, (200, 200, 200), 1)


def draw_fcw_box(frame, best_box, distance_m):
    if best_box is None:
        return
    x1, y1, x2, y2 = best_box
    color = (0,0,255) if distance_m < FCW_DANGER_M else (0,165,255)
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.putText(frame, f"{distance_m:.1f}m", (x1, y1-8),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2, cv2.LINE_AA)


def draw_distance_bar(frame, distance_m, w):
    bar_w   = w - 40
    clamped = max(0, min(distance_m, FCW_WARNING_M))
    ratio   = 1.0 - (clamped / FCW_WARNING_M)
    filled  = int(bar_w * ratio)
    color   = ((0,200,80) if ratio < 0.4
                else (0,165,255) if ratio < 0.75
                else (0,0,255))
    cv2.rectangle(frame, (20, 8), (20+bar_w, 22), (55,55,55), -1)
    cv2.rectangle(frame, (20, 8), (20+filled, 22), color, -1)
    label = ("clear" if distance_m >= FCW_WARNING_M
              else f"ahead: {distance_m:.1f}m")
    cv2.putText(frame, label, (20, 6),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200,200,200), 1, cv2.LINE_AA)


# ══════════════════════════════════════════════════════════════════════════
# RUN ADAS — FONCTION PRINCIPALE
# ══════════════════════════════════════════════════════════════════════════

def run_adas(stop_event=None, cam_index: int = 1):
    """
    Lance l'ADAS sur cam_index (défaut=1 = CAM USB).
    Appelé par main.py dans un thread dédié.
    """
    global FPS

    init_db()

    yolo = AdasYoloWorker()
    yolo.start()
    ldw  = LdwTracker()
    fcw  = FcwTracker()

    print(f"[ADAS] Ouverture caméra index={cam_index} (CAM USB)...")
    cap = cv2.VideoCapture(cam_index)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS,          FPS)

    if not cap.isOpened():
        print(f"[ADAS] ERREUR : impossible d'ouvrir CAM index={cam_index}")
        return

    _frame_delay = max(1, int(1000 / FPS))
    frame_idx    = 0
    print(f"[ADAS] ✅ Démarré — CAM USB index={cam_index}")

    while True:
        if stop_event and stop_event.is_set():
            break

        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue

        h, w = frame.shape[:2]

        if frame_idx % 8 == 0:
            yolo.submit(frame)
        frame_idx += 1

        left_x, right_x, _, roi_pts       = detect_lanes(frame)
        ldw_left, ldw_right, lane_cx, dep = ldw.update(left_x, right_x, w)
        dist_m, best_box                   = closest_vehicle_distance(
                                                yolo.detections, w, h)
        fcw_warn, fcw_danger               = fcw.update(dist_m)

        if DISPLAY:
            draw_lane_overlay(frame, left_x, right_x,
                              lane_cx, roi_pts, dep)
            draw_fcw_box(frame, best_box, dist_m)
            draw_distance_bar(frame, dist_m, w)

            y = 60
            if ldw_left:
                draw_alert(frame, "!! LDW — DRIFTING LEFT",
                           y, (0,100,255)); y+=40
            if ldw_right:
                draw_alert(frame, "!! LDW — DRIFTING RIGHT",
                           y, (0,100,255)); y+=40
            if fcw_danger:
                draw_alert(frame, "!! FCW — COLLISION RISK",
                           y, (0,0,255));   y+=40
            elif fcw_warn:
                draw_alert(frame, "!! FCW — TOO CLOSE",
                           y, (0,165,255)); y+=40

            if dep == "LEFT" and not ldw_left:
                cv2.putText(frame, "< drifting left", (20, h-20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                            (0,165,255), 1, cv2.LINE_AA)
            elif dep == "RIGHT" and not ldw_right:
                cv2.putText(frame, "drifting right >", (w-200, h-20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                            (0,165,255), 1, cv2.LINE_AA)

            cv2.putText(frame, f"ADAS | CAM-{cam_index} | USB",
                        (w-210, 20), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (100,200,255), 1, cv2.LINE_AA)

            cv2.imshow("ADAS — Road Monitor", frame)
            if cv2.waitKey(_frame_delay) & 0xFF == 27:
                break

    # Nettoyage propre
    cap.release()
    if DISPLAY:
        try:
            prop = cv2.getWindowProperty(
                "ADAS — Road Monitor", cv2.WND_PROP_VISIBLE)
            if prop >= 0:
                cv2.destroyWindow("ADAS — Road Monitor")
        except cv2.error:
            pass
    yolo.stop()
    print("[ADAS] Arrêté.")


if __name__ == "__main__":
    run_adas(cam_index=1)