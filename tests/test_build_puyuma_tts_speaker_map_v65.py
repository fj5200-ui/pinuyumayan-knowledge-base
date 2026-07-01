from __future__ import annotations

import tempfile
import unittest
from pathlib import Path


class BuildPuyumaTtsSpeakerMapV65Tests(unittest.TestCase):
    def test_selects_one_wav_per_dialect_directory(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for dialect, filename in [
                ("Nanwang_Puyuma", "a.wav"),
                ("Nanwang_Puyuma", "b.wav"),
                ("Jianhe_Puyuma", "c.wav"),
            ]:
                path = root / "repo" / "Puyuma" / dialect / filename
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"wav")

            dialect_map: dict[str, str] = {}
            for wav in sorted(root.rglob("*.wav")):
                parent = wav.parent.name
                if parent.endswith("_Puyuma") and parent not in dialect_map:
                    dialect_map[parent] = str(wav)

            self.assertEqual(set(dialect_map), {"Nanwang_Puyuma", "Jianhe_Puyuma"})
            self.assertTrue(dialect_map["Nanwang_Puyuma"].endswith("a.wav"))


if __name__ == "__main__":
    unittest.main()
