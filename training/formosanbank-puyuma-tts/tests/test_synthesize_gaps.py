from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from formosanbank_puyuma.synthesize_gaps import _speaker_wav_for_row, _synthesize_row


class _FakeTTS:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict[str, object]]] = []

    def tts_to_file(self, **kwargs) -> None:
        self.calls.append(("tts_to_file", kwargs))

    def tts_with_vc_to_file(self, text: str, **kwargs) -> None:
        payload = dict(kwargs)
        payload["text"] = text
        self.calls.append(("tts_with_vc_to_file", payload))


class SynthesizeGapsTests(unittest.TestCase):
    def test_speaker_wav_prefers_dialect_map(self) -> None:
        speaker_wav = _speaker_wav_for_row(
            dialect="Jianhe_Puyuma",
            speaker_map={"Jianhe_Puyuma": "/tmp/j.wav"},
            fallback_speaker_wav=Path("/tmp/fallback.wav"),
        )
        self.assertEqual(speaker_wav, "/tmp/j.wav")

    def test_speaker_wav_falls_back_to_cli_value(self) -> None:
        fallback = Path("/tmp/fallback.wav")
        speaker_wav = _speaker_wav_for_row(
            dialect="Jianhe_Puyuma",
            speaker_map={},
            fallback_speaker_wav=fallback,
        )
        self.assertEqual(speaker_wav, str(fallback))

    def test_standard_tts_path_calls_tts_to_file(self) -> None:
        fake = _FakeTTS()
        with tempfile.TemporaryDirectory() as tmp_dir:
            _synthesize_row(
                fake,
                text="salamat",
                file_path=Path(tmp_dir) / "out.wav",
                speaker_wav="/tmp/ref.wav",
                speaker_idx="demo-speaker",
                language="pyu",
                with_vc=False,
            )
        self.assertEqual(fake.calls[0][0], "tts_to_file")
        self.assertEqual(fake.calls[0][1]["speaker_wav"], "/tmp/ref.wav")
        self.assertEqual(fake.calls[0][1]["speaker"], "demo-speaker")
        self.assertEqual(fake.calls[0][1]["language"], "pyu")

    def test_vc_path_requires_reference_audio(self) -> None:
        fake = _FakeTTS()
        with tempfile.TemporaryDirectory() as tmp_dir:
            with self.assertRaisesRegex(ValueError, "speaker_wav"):
                _synthesize_row(
                    fake,
                    text="salamat",
                    file_path=Path(tmp_dir) / "out.wav",
                    speaker_wav=None,
                    speaker_idx=None,
                    language=None,
                    with_vc=True,
                )

    def test_vc_path_calls_tts_with_vc_to_file(self) -> None:
        fake = _FakeTTS()
        with tempfile.TemporaryDirectory() as tmp_dir:
            _synthesize_row(
                fake,
                text="salamat",
                file_path=Path(tmp_dir) / "out.wav",
                speaker_wav="/tmp/ref.wav",
                speaker_idx=None,
                language=None,
                with_vc=True,
            )
        self.assertEqual(fake.calls[0][0], "tts_with_vc_to_file")
        self.assertEqual(fake.calls[0][1]["speaker_wav"], "/tmp/ref.wav")
        self.assertEqual(fake.calls[0][1]["file_path"], str(Path(tmp_dir) / "out.wav"))


if __name__ == "__main__":
    unittest.main()
