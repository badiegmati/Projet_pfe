"""
gps_simulator.py — Simulateur GPS zone Tunis
Alpha Technology — PFE 2024-2025
"""

import math
import random
import threading
from typing import Tuple


class GPSSimulator:

    def __init__(self, config: dict):
        gps = config.get("gps_simulation", {})
        self.lat_centre  = gps.get("lat_centre",  36.8065)
        self.lon_centre  = gps.get("lon_centre",  10.1815)
        self.rayon_km    = gps.get("rayon_km",    15.0)
        self.vitesse_min = gps.get("vitesse_min", 0.0)
        self.vitesse_max = gps.get("vitesse_max", 130.0)

        self._latitude  = self.lat_centre
        self._longitude = self.lon_centre
        self._vitesse   = 50.0
        self._cap       = random.uniform(0, 360)
        self._lock      = threading.Lock()
        self._running   = False
        self._stop_evt  = threading.Event()

    def start(self):
        self._running = True
        self._stop_evt.clear()
        threading.Thread(target=self._loop, daemon=True,
                         name="GPS-Sim").start()
        print(f"[GPS] Simulateur démarré — "
              f"Centre: ({self.lat_centre}, {self.lon_centre})")

    def stop(self):
        self._running = False
        self._stop_evt.set()

    def _loop(self):
        import time
        while self._running and not self._stop_evt.is_set():
            self._update()
            self._stop_evt.wait(timeout=1.0)

    def _update(self):
        with self._lock:
            self._cap += random.uniform(-5, 5)
            self._cap  = self._cap % 360
            rad        = math.radians(self._cap)
            step       = 0.0001
            delta_lat  = step * math.cos(rad) * random.uniform(0.5, 1.5)
            delta_lon  = step * math.sin(rad) * random.uniform(0.5, 1.5)
            new_lat    = self._latitude  + delta_lat
            new_lon    = self._longitude + delta_lon
            if self._haversine(self.lat_centre, self.lon_centre,
                                new_lat, new_lon) <= self.rayon_km:
                self._latitude  = new_lat
                self._longitude = new_lon
            else:
                self._cap = (self._cap + 180) % 360
            self._vitesse += random.uniform(-5, 5)
            self._vitesse  = max(self.vitesse_min,
                                  min(self.vitesse_max, self._vitesse))

    def get_position(self) -> Tuple[float, float, float, float]:
        with self._lock:
            return (round(self._latitude,  7),
                    round(self._longitude, 7),
                    round(self._vitesse,   2),
                    round(self._cap,       2))

    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2) -> float:
        R    = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a    = (math.sin(dlat/2)**2 +
                math.cos(math.radians(lat1)) *
                math.cos(math.radians(lat2)) *
                math.sin(dlon/2)**2)
        return R * 2 * math.asin(math.sqrt(a))