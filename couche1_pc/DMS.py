"""
DMS — Driver Monitoring System
Alpha Technology — PFE 2024-2025
CAM PC (index=0)

Détecte :
  Fatigue    : fermeture yeux, bâillement, tête tombante
  Distraction: regard détourné
  Téléphone, Cigarette, Ceinture de sécurité

MODIFICATIONS vs original :
  → run_dms(stop_event, cam_index) reçoit l'index caméra
  → duree_secondes calculée et passée à log_event_to_db()
  → EyeClosureTracker mesure la durée réelle en secondes
  → EventLogger mesure la durée réelle par type
"""

import cv2
import mediapipe as mp
import numpy as np
import threading
import time
from Shared import init_db, log_event_to_db, SEVERITY

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("[DMS][WARN] ultralytics non installé — détection téléphone désactivée.")

# ══════════════════════════════════════════════════════════════════════════
# CONFIG
# ══════════════════════════════════════════════════════════════════════════

YOLO_MODEL = "yolov8n.pt"
DISPLAY    = True
FPS        = 30
SIM_LOOP   = True
SIM_SPEED  = 1.0

# ── Seuils yeux ───────────────────────────────────────────────────────────
EAR_THRESHOLD    = 0.22
BLINK_MAX_FRAMES = 7
DROWSY_FRAMES    = 15
CLOSED_FRAMES    = FPS * 2

# ── Autres seuils ─────────────────────────────────────────────────────────
MAR_THRESHOLD       = 0.20
HEAD_DROP_THRESHOLD = 0.80
YAW_LEFT_THRESHOLD  = 0.35
YAW_RIGHT_THRESHOLD = 0.65
HAND_MOUTH_DIST_PX  = 80

# ── Frames consécutives avant alerte ─────────────────────────────────────
CONSEC_FRAMES = {
    "FATIGUE_YAWN": 10,
    "FATIGUE_DROP": 20,
    "DISTRACTION" : 12,
    "PHONE"       : 8,
    "SMOKING"     : 12,
    "SEATBELT"    : 40,
}

# ── Cooldowns ─────────────────────────────────────────────────────────────
COOLDOWN = {
    "FATIGUE_EYES_DROWSY": 15,
    "FATIGUE_EYES_CLOSED": 10,
    "FATIGUE_YAWN"       : 30,
    "FATIGUE_DROP"       : 20,
    "DISTRACTION"        : 15,
    "PHONE"              : 25,
    "SMOKING"            : 1,
    "SEATBELT"           : 60,
}

# ── Landmarks MediaPipe ───────────────────────────────────────────────────
LEFT_EYE     = [33, 160, 158, 133, 153, 144]
RIGHT_EYE    = [362, 385, 387, 263, 373, 380]
MOUTH_TOP    = 13
MOUTH_BOTTOM = 14
NOSE_TIP     = 1
CHIN         = 152
FOREHEAD     = 10
LEFT_CHEEK   = 234
RIGHT_CHEEK  = 454


# ══════════════════════════════════════════════════════════════════════════
# EYE CLOSURE TRACKER — durée réelle en secondes
# ══════════════════════════════════════════════════════════════════════════

class EyeClosureTracker:
    """
    Suit la fermeture des yeux.
    Mesure la durée réelle via time.time().
    """

    def __init__(self):
        self._frames       = 0
        self._drowsy_fired = False
        self._close_start  = None
        self._last = {
            "FATIGUE_EYES_DROWSY": 0.0,
            "FATIGUE_EYES_CLOSED": 0.0,
        }

    def update(self, eyes_closed: bool):
        drowsy_fired = False
        closed_fired = False
        now          = time.time()

        if eyes_closed:
            self._frames += 1
            if self._close_start is None:
                self._close_start = now
            duree_reelle = now - self._close_start

            # Alerte somnolence
            if (self._frames == DROWSY_FRAMES
                    and not self._drowsy_fired
                    and now - self._last["FATIGUE_EYES_DROWSY"]
                    > COOLDOWN["FATIGUE_EYES_DROWSY"]):
                drowsy_fired       = True
                self._drowsy_fired = True
                self._last["FATIGUE_EYES_DROWSY"] = now
                log_event_to_db("FATIGUE_EYES_DROWSY", duree_secondes=2.0)

            # Alerte yeux fermés > 2s
            if (self._frames >= CLOSED_FRAMES
                    and now - self._last["FATIGUE_EYES_CLOSED"]
                    > COOLDOWN["FATIGUE_EYES_CLOSED"]
                    and duree_reelle >= 2.0):
                closed_fired = True
                self._last["FATIGUE_EYES_CLOSED"] = now
                log_event_to_db("FATIGUE_EYES_CLOSED",
                                duree_secondes=round(duree_reelle, 2))
        else:
            self._frames       = 0
            self._drowsy_fired = False
            self._close_start  = None

        return drowsy_fired, closed_fired

    @property
    def frames(self):
        return self._frames

    @property
    def duree_fermeture(self) -> float:
        if self._close_start is None:
            return 0.0
        return time.time() - self._close_start


# ══════════════════════════════════════════════════════════════════════════
# EVENT LOGGER — durée réelle par type
# ══════════════════════════════════════════════════════════════════════════

class EventLogger:
    """
    Journalise les événements avec durée réelle calculée.
    """

    def __init__(self):
        self._counters   = {k: 0    for k in CONSEC_FRAMES}
        self._last       = {k: 0.0  for k in CONSEC_FRAMES}
        self._start_time = {k: None for k in CONSEC_FRAMES}

    def tick(self, event_type: str, condition: bool) -> bool:
        if condition:
            self._counters[event_type] += 1
            if self._start_time[event_type] is None:
                self._start_time[event_type] = time.time()
        else:
            self._counters[event_type]   = 0
            self._start_time[event_type] = None
            return False

        if self._counters[event_type] < CONSEC_FRAMES[event_type]:
            return False

        now = time.time()
        if now - self._last[event_type] < COOLDOWN[event_type]:
            return False

        start = self._start_time[event_type]
        duree = (now - start) if start else 2.0
        duree = max(duree, 2.0)

        self._last[event_type]       = now
        self._counters[event_type]   = 0
        self._start_time[event_type] = None

        log_event_to_db(event_type, duree_secondes=round(duree, 2))
        return True


# ══════════════════════════════════════════════════════════════════════════
# GEOMETRY HELPERS
# ══════════════════════════════════════════════════════════════════════════

def dist(p1, p2):
    return np.linalg.norm(np.array(p1, dtype=float) - np.array(p2, dtype=float))


def eye_aspect_ratio(lm, eye_idx):
    p1, p2, p3, p4, p5, p6 = [lm[i] for i in eye_idx]
    v = dist(p2, p6) + dist(p3, p5)
    h = dist(p1, p4)
    return (v / (2.0 * h)) if h else 0.0


def mouth_aspect_ratio(lm):
    face_w = dist(lm[LEFT_CHEEK], lm[RIGHT_CHEEK])
    return (dist(lm[MOUTH_TOP], lm[MOUTH_BOTTOM]) / face_w) if face_w else 0.0


def head_pose(lm, fw, fh):
    nose   = np.array(lm[NOSE_TIP])
    chin   = np.array(lm[CHIN])
    fore   = np.array(lm[FOREHEAD])
    yaw_r  = nose[0] / fw
    face_h = dist(fore, chin)
    pitch_r = (dist(nose, chin) / face_h) if face_h else 0.5
    return yaw_r, pitch_r


# ══════════════════════════════════════════════════════════════════════════
# SEATBELT DETECTION
# ══════════════════════════════════════════════════════════════════════════

def detect_seatbelt(frame) -> bool:
    h, w = frame.shape[:2]
    roi  = frame[int(h*0.2):int(h*0.7), int(w*0.4):int(w*0.9)]
    hsv  = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    mask = cv2.bitwise_or(
        cv2.inRange(hsv, (0, 0, 0),   (180, 60, 80)),
        cv2.inRange(hsv, (0, 0, 80),  (180, 40, 200))
    )
    edges = cv2.Canny(mask, 30, 100)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180,
                             threshold=25, minLineLength=40, maxLineGap=15)
    if lines is None:
        return False
    for line in lines:
        x1, y1, x2, y2 = line[0]
        dx, dy = abs(x2-x1), abs(y2-y1)
        if dy == 0:
            continue
        if 30 < np.degrees(np.arctan2(dy, dx)) < 70 and dy > 30:
            return True
    return False


# ══════════════════════════════════════════════════════════════════════════
# YOLO WORKER — Téléphone
# ══════════════════════════════════════════════════════════════════════════

class YoloWorker:
    PHONE_CLASS = 67

    def __init__(self):
        self.phone_detected = False
        self._frame         = None
        self._lock          = threading.Lock()
        self._running       = False

    def start(self):
        if not YOLO_AVAILABLE:
            return
        self._model   = YOLO(YOLO_MODEL)
        self._running = True
        threading.Thread(target=self._loop, daemon=True,
                         name="DMS-YOLO").start()

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
            small = cv2.resize(frame, (320, 240))
            res   = self._model(small, verbose=False, conf=0.45)[0]
            self.phone_detected = (
                any(int(b.cls) == self.PHONE_CLASS for b in res.boxes)
                if res.boxes else False
            )
            time.sleep(0.1)

    def stop(self):
        self._running = False


# ══════════════════════════════════════════════════════════════════════════
# SMOKING DETECTION
# ══════════════════════════════════════════════════════════════════════════

def detect_smoking(hand_lm_list, mouth_pos, fw, fh) -> bool:
    if not hand_lm_list:
        return False
    mx, my = mouth_pos
    for hl in hand_lm_list:
        close = [
            fid for fid in [4, 8, 12, 16, 20]
            if dist(
                (int(hl.landmark[fid].x * fw),
                 int(hl.landmark[fid].y * fh)),
                (mx, my)
            ) < HAND_MOUTH_DIST_PX
        ]
        if sorted(close) == [8, 12]:
            return True
    return False


# ══════════════════════════════════════════════════════════════════════════
# DISPLAY HELPERS
# ══════════════════════════════════════════════════════════════════════════

def draw_alert(frame, text, y, color=(0, 0, 255)):
    cv2.putText(frame, text, (20, y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)


def draw_status(frame, label, ok, y):
    cv2.circle(frame, (18, y-7), 7,
               (0, 200, 80) if ok else (0, 0, 220), -1)
    cv2.putText(frame, label, (32, y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.52, (220, 220, 220), 1, cv2.LINE_AA)


def draw_eye_bar(frame, closed_frames, w, duree_s=0.0):
    if closed_frames <= BLINK_MAX_FRAMES:
        return
    bar_w  = w - 40
    ratio  = min(closed_frames / CLOSED_FRAMES, 1.0)
    filled = int(bar_w * ratio)
    color  = ((0,200,80) if ratio < 0.4
               else (0,165,255) if ratio < 0.8
               else (0,0,255))
    cv2.rectangle(frame, (20, 222), (20+bar_w, 236), (55,55,55), -1)
    cv2.rectangle(frame, (20, 222), (20+filled, 236), color, -1)
    cv2.putText(frame, f"Eyes closed: {duree_s:.1f}s",
                (20, 218), cv2.FONT_HERSHEY_SIMPLEX,
                0.45, (200,200,200), 1, cv2.LINE_AA)


# ══════════════════════════════════════════════════════════════════════════
# RUN DMS — FONCTION PRINCIPALE
# ══════════════════════════════════════════════════════════════════════════

def run_dms(stop_event=None, cam_index: int = 0):
    """
    Lance le DMS sur cam_index (défaut=0 = CAM PC).
    Appelé par main.py dans un thread dédié.
    """
    global FPS, CLOSED_FRAMES

    init_db()

    mp_face      = mp.solutions.face_mesh
    mp_hands_mod = mp.solutions.hands
    mp_draw      = mp.solutions.drawing_utils

    face_mesh = mp_face.FaceMesh(
        max_num_faces            = 1,
        refine_landmarks         = False,
        min_detection_confidence = 0.5,
        min_tracking_confidence  = 0.5,
    )
    hands_det = mp_hands_mod.Hands(
        max_num_hands            = 2,
        min_detection_confidence = 0.55,
        min_tracking_confidence  = 0.55,
    )

    yolo        = YoloWorker()
    yolo.start()
    logger      = EventLogger()
    eye_tracker = EyeClosureTracker()

    print(f"[DMS] Ouverture caméra index={cam_index} (CAM PC)...")
    cap = cv2.VideoCapture(cam_index)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS,          FPS)

    if not cap.isOpened():
        print(f"[DMS] ERREUR : impossible d'ouvrir CAM index={cam_index}")
        return

    _frame_delay = max(1, int(1000 / FPS))
    frame_idx    = 0
    seatbelt_ok  = True
    print(f"[DMS] ✅ Démarré — CAM PC index={cam_index}")

    while True:
        if stop_event and stop_event.is_set():
            break

        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue

        frame = cv2.flip(frame, 1)
        h, w  = frame.shape[:2]
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_res = face_mesh.process(rgb)
        hand_res = hands_det.process(rgb)

        if frame_idx % 10 == 0:
            yolo.submit(frame)
        frame_idx += 1

        eyes_closed  = False
        yawning      = False
        head_drop    = False
        looking_away = False
        mouth_px     = (w//2, h//2)

        if face_res.multi_face_landmarks:
            face = face_res.multi_face_landmarks[0]
            if DISPLAY:
                mp_draw.draw_landmarks(
                    frame, face, mp_face.FACEMESH_CONTOURS,
                    mp_draw.DrawingSpec(color=(80,80,80),
                                        thickness=1, circle_radius=1),
                    mp_draw.DrawingSpec(color=(80,200,80), thickness=1)
                )
            lm = [(int(p.x*w), int(p.y*h)) for p in face.landmark]

            ear = (eye_aspect_ratio(lm, LEFT_EYE) +
                   eye_aspect_ratio(lm, RIGHT_EYE)) / 2.0
            eyes_closed  = ear < EAR_THRESHOLD
            yawning      = mouth_aspect_ratio(lm) > MAR_THRESHOLD
            yaw_r, pitch_r = head_pose(lm, w, h)
            looking_away = (yaw_r < YAW_LEFT_THRESHOLD or
                            yaw_r > YAW_RIGHT_THRESHOLD)
            head_drop    = pitch_r < HEAD_DROP_THRESHOLD
            mouth_px     = lm[MOUTH_TOP]

        if DISPLAY and hand_res.multi_hand_landmarks:
            for hl in hand_res.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hl, mp_hands_mod.HAND_CONNECTIONS)

        if frame_idx % 30 == 0:
            seatbelt_ok = detect_seatbelt(frame)

        a_drowsy, a_closed = eye_tracker.update(eyes_closed)
        a_yawn  = logger.tick("FATIGUE_YAWN", yawning)
        a_drop  = logger.tick("FATIGUE_DROP", head_drop)
        a_dist  = logger.tick("DISTRACTION",  looking_away)
        a_phone = logger.tick("PHONE",        yolo.phone_detected)
        a_smoke = logger.tick("SMOKING",
                               detect_smoking(hand_res.multi_hand_landmarks,
                                              mouth_px, w, h))
        a_belt  = logger.tick("SEATBELT", not seatbelt_ok)

        if DISPLAY:
            cv2.rectangle(frame, (0,0), (212, 210), (25,25,25), -1)
            draw_status(frame, "Eyes open",  not eyes_closed,          28)
            draw_status(frame, "No yawning", not yawning,              53)
            draw_status(frame, "Head up",    not head_drop,            78)
            draw_status(frame, "On road",    not looking_away,        103)
            draw_status(frame, "No phone",   not yolo.phone_detected, 128)
            draw_status(frame, "No smoking", True,                    153)
            draw_status(frame, "Seatbelt",   seatbelt_ok,             178)

            draw_eye_bar(frame, eye_tracker.frames, w,
                         eye_tracker.duree_fermeture)

            y = 250
            if a_drowsy: draw_alert(frame, "!! DROWSY",          y, (0,165,255)); y+=35
            if a_closed: draw_alert(frame, "!! EYES CLOSED >2s", y, (0,0,255));   y+=35
            if a_yawn:   draw_alert(frame, "!! YAWNING",         y);              y+=35
            if a_drop:   draw_alert(frame, "!! HEAD DROOPING",   y);              y+=35
            if a_dist:   draw_alert(frame, "!! LOOKING AWAY",    y);              y+=35
            if a_phone:  draw_alert(frame, "!! PHONE IN USE",    y);              y+=35
            if a_smoke:  draw_alert(frame, "!! SMOKING",         y);              y+=35
            if a_belt:   draw_alert(frame, "!! NO SEATBELT",     y, (0,165,255))

            cv2.putText(frame, f"DMS | CAM-{cam_index} | PC",
                        (w-180, 20), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, (100,255,100), 1, cv2.LINE_AA)

            cv2.imshow("DMS — Driver Monitor", frame)
            if cv2.waitKey(_frame_delay) & 0xFF == 27:
                break

    # Nettoyage propre
    cap.release()
    if DISPLAY:
        try:
            prop = cv2.getWindowProperty(
                "DMS — Driver Monitor", cv2.WND_PROP_VISIBLE)
            if prop >= 0:
                cv2.destroyWindow("DMS — Driver Monitor")
        except cv2.error:
            pass
    yolo.stop()
    face_mesh.close()
    hands_det.close()
    print("[DMS] Arrêté.")


if __name__ == "__main__":
    run_dms(cam_index=0)