from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "build_puyuma_tts_gap_manifest_v65.py"
SPEC = importlib.util.spec_from_file_location("build_puyuma_tts_gap_manifest_v65", SCRIPT_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class BuildPuyumaTtsGapManifestV65Tests(unittest.TestCase):
    def test_build_gap_manifest_keeps_only_missing_public_audio(self) -> None:
        corpus_entries = [
            {
                "id": "gap-1",
                "text": {"puyuma_form": "muasalr", "zh_tw": "改變"},
                "audio": {"url": "https://example.com/missing.mp3"},
                "source": {"source_path": "demo.csv", "source_row": 7, "repository": "FormosanBank/FormosanBank", "commit": "abc"},
                "category": {"source_category": "文化篇", "website_category_key": "ritual_culture"},
                "tts": {"tts_text": "muasalr"},
            },
            {
                "id": "gap-2",
                "text": {"puyuma_form": "adi", "zh_tw": "不"},
                "audio": {"url": "https://example.com/found.mp3"},
                "source": {"source_path": "demo.csv", "source_row": 8, "repository": "FormosanBank/FormosanBank", "commit": "def"},
                "category": {"source_category": "日常會話", "website_category_key": "daily_conversation"},
                "tts": {"tts_text": "adi"},
            },
        ]
        gap_rows = [
            {
                "id": "gap-1",
                "dialect": "Zhiben_Puyuma",
                "topic": "文化篇",
                "source_row": 7,
                "hf_relative_path": "Puyuma/Zhiben/demo.wav",
                "public_url": "https://example.com/missing.mp3",
                "public_url_status": "404_missing_upstream",
            },
            {
                "id": "gap-2",
                "dialect": "Nanwang_Puyuma",
                "topic": "九階教材",
                "source_row": 8,
                "hf_relative_path": "Puyuma/Nanwang/demo.wav",
                "public_url": "https://example.com/found.mp3",
                "public_url_status": "downloaded_from_public_url",
            },
        ]

        rows, skipped = MODULE.build_gap_manifest(corpus_entries, gap_rows)

        self.assertEqual(len(rows), 1)
        self.assertEqual(skipped, [])
        self.assertEqual(rows[0]["entry_id"], "gap-1")
        self.assertEqual(rows[0]["dialect"], "Zhiben_Puyuma")
        self.assertEqual(rows[0]["text"], "muasalr")
        self.assertEqual(rows[0]["zh_tw"], "改變")
        self.assertFalse(rows[0]["public_release_allowed"])
        self.assertTrue(rows[0]["native_review_required"])


if __name__ == "__main__":
    unittest.main()
