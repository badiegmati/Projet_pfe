"""
sqlite_manager.py — Gestion SQLite store-and-forward
Alpha Technology — PFE 2024-2025
"""

import sqlite3
import os
import threading
from datetime import datetime, timedelta
from typing import List, Dict, Any

_lock = threading.Lock()


class SQLiteManager:

    def __init__(self, db_path: str, retention_jours: int = 10):
        self.db_path         = db_path
        self.retention_jours = retention_jours
        dossier = os.path.dirname(db_path)
        if dossier:
            os.makedirs(dossier, exist_ok=True)

    def get_pending_events(self, batch_size: int = 20) -> List[Dict[str, Any]]:
        """Retourne événements non envoyés avec duree >= 2s."""
        with _lock:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM events_pending
                WHERE sent = 0
                  AND duree_secondes >= 2.0
                ORDER BY id ASC
                LIMIT ?
            """, (batch_size,))
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
        return rows

    def mark_as_sent(self, event_ids: List[int]):
        """Marque les événements comme envoyés."""
        if not event_ids:
            return
        placeholders = ",".join("?" * len(event_ids))
        with _lock:
            conn = sqlite3.connect(self.db_path)
            conn.execute(
                f"UPDATE events_pending SET sent=1 "
                f"WHERE id IN ({placeholders})",
                event_ids
            )
            conn.commit()
            conn.close()

    def purge_old_events(self):
        """Supprime événements envoyés > retention_jours jours."""
        cutoff = (
            datetime.utcnow() - timedelta(days=self.retention_jours)
        ).isoformat()
        with _lock:
            conn = sqlite3.connect(self.db_path)
            cur  = conn.execute("""
                DELETE FROM events_pending
                WHERE sent = 1 AND created_at < ?
            """, (cutoff,))
            deleted = cur.rowcount
            conn.commit()
            conn.close()
        if deleted > 0:
            print(f"[SQLite] Purge : {deleted} événements supprimés")

    def get_stats(self) -> Dict[str, int]:
        """Statistiques pour monitoring."""
        with _lock:
            conn    = sqlite3.connect(self.db_path)
            total   = conn.execute(
                "SELECT COUNT(*) FROM events_pending"
            ).fetchone()[0]
            envoyes = conn.execute(
                "SELECT COUNT(*) FROM events_pending WHERE sent=1"
            ).fetchone()[0]
            pending = conn.execute(
                "SELECT COUNT(*) FROM events_pending "
                "WHERE sent=0 AND duree_secondes >= 2.0"
            ).fetchone()[0]
            conn.close()
        return {
            "total"     : total,
            "envoyes"   : envoyes,
            "en_attente": pending,
        }