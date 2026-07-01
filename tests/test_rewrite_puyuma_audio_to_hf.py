import importlib.util
from pathlib import Path
from unittest import TestCase, mock


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "rewrite_puyuma_audio_to_hf.py"
SPEC = importlib.util.spec_from_file_location("rewrite_puyuma_audio_to_hf", SCRIPT_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class RewritePuyumaAudioToHFTests(TestCase):
    def test_xml_learning_vocabulary_entry_uses_hf_dataset(self) -> None:
        entry = {
            "id": "puyuma-audio-test",
            "category": {"source_category": "未分類"},
            "language": {"dialect_name": "Nanwang_Puyuma"},
            "audio": {
                "url": "https://ilrdc.tw/tow/2022/audio/word/38/01_01.wav",
                "mime_type": "audio/wav",
                "source_file": "xue_xi_ci_biao_learning_vocabulary_Nanwang_Puyuma_0.wav",
            },
            "source": {
                "source_path": r"repo\external\formosanbank_puyuma\Corpora\ePark\XML\xue_xi_ci_biao_learning_vocabulary\Puyuma\Nanwang_Puyuma.xml",
                "source_row": 1,
                "source_format": "xml",
            },
        }
        expected_relative_path = "Puyuma/Nanwang_Puyuma/xue_xi_ci_biao_learning_vocabulary_Nanwang_Puyuma_0.wav"

        def fake_index(dataset_id: str) -> set[str]:
            if dataset_id == "FormosanBank/ePark_xue_xi_ci_biao_learning_vocabulary":
                return {expected_relative_path}
            return set()

        with mock.patch.object(MODULE, "load_hf_file_index", side_effect=fake_index):
            rewritten_entries, report = MODULE.rewrite_entries([entry])

        self.assertEqual(report["hf_resolved_entries"], 1)
        self.assertEqual(report["unresolved_entries"], 0)
        self.assertEqual(
            rewritten_entries[0]["source"]["audio_resolution_detail"],
            expected_relative_path,
        )
        self.assertIn(
            "/FormosanBank/ePark_xue_xi_ci_biao_learning_vocabulary/resolve/main/",
            rewritten_entries[0]["audio"]["url"],
        )
