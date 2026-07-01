# Puyuma Audio Package Release Report v66

## Scope

- Corpus entries verified: `46,395`
- Dialects covered: `38`, `39`, `40`, `41`
- Final packaged entry audio files: `46,376`
- Final completion: `99.9590%`
- Remaining permanent gaps: `19`

## Package Outputs

- Local entry-expanded MP3 directory: `artifacts/puyuma_audio_mp3_package_hf/audio`
- Local ZIP package: `artifacts/puyuma_audio_mp3_package_hf.zip`
- Unique cached MP3 files: `artifacts/puyuma_audio_unique_mp3_cache_hf`

## Final Sizes

- Unique cache: `915,657,889` bytes (`0.916 GB`, `0.853 GiB`)
- Expanded entry package: `1,158,260,865` bytes (`1.158 GB`, `1.079 GiB`)
- ZIP package: `1,164,660,775` bytes (`1.165 GB`, `1.085 GiB`)

## Source Resolution

- HF-resolved corpus entries: `46,375 / 46,395`
- One additional entry remained downloadable from the original public URL
- Intermediate HF `429 Too Many Requests` failures were retried successfully
- Final unresolved entries are permanent upstream gaps only

## Validation

### Strict corpus validation

```bash
python scripts/validate_full_puyuma_corpus_output.py ../artifacts/puyuma_full_corpus.json --min-entries 1000 --require-all-dialects --require-source-phon
```

Observed result:

- `46395` entries
- dialect counts `{'38': 11958, '39': 11709, '40': 11579, '41': 11149}`
- source formats `{'csv': 29164, 'xml': 17231}`
- `source_phon=17231`

### HF rewrite regression test

```bash
python -m unittest tests.test_rewrite_puyuma_audio_to_hf
```

Observed result:

- `1` test
- `OK`

## Final Mirror Status

- Mirror report status: `partial_ok`
- Unique URLs processed: `41,213`
- Unique URLs present locally: `41,194`
- Unique URLs missing upstream: `19`
- Expanded entry files present locally: `46,376`
- Expanded entry files missing: `19`

## Permanent Missing Audio Entries

These entries were confirmed missing across all checked public sources:

- Hugging Face dataset mirror
- Original Klokah public URLs
- Public Google Drive mirror listing

Missing entry IDs and URLs:

- `puyuma-audio-0e7a45d3fe6551` -> `https://web.klokah.tw/ninew/sound/03/04/08-C-2-5.mp3`
- `puyuma-audio-ec92103e10d172` -> `https://web.klokah.tw/ninew/sound/03/04/08-C-2-6.mp3`
- `puyuma-audio-2576a2fe7d4414` -> `https://web.klokah.tw/extension/cu_data/audio/39/39_17_V20.mp3`
- `puyuma-audio-ebf4ec237bb48a` -> `https://web.klokah.tw/extension/cu_data/audio/40/40_5_V11.mp3`
- `puyuma-audio-4aff499ea1b98d` -> `https://web.klokah.tw/extension/cu_data/audio/40/40_5_V12.mp3`
- `puyuma-audio-45cc164b6a3808` -> `https://web.klokah.tw/extension/cu_data/audio/40/40_5_V13.mp3`
- `puyuma-audio-4c637ca3348f09` -> `https://web.klokah.tw/extension/cu_data/audio/40/40_5_V14.mp3`
- `puyuma-audio-58c4bc34af01cc` -> `https://web.klokah.tw/extension/cu_data/audio/40/40_5_V15.mp3`
- `puyuma-audio-d036fb65a24a52` -> `https://klokah.tw/extension/con_data/sound/40/sentence/40c5s12.mp3`
- `puyuma-audio-f07331480ad9b5` -> `https://web.klokah.tw/ninew/sound/04/03/03-C-2-10.mp3`
- `puyuma-audio-7f182d09cd4328` -> `https://web.klokah.tw/ninew/sound/04/03/08-C-1-13.mp3`
- `puyuma-audio-06743a1c3f058d` -> `https://web.klokah.tw/ninew/sound/04/03/08-C-1-14.mp3`
- `puyuma-audio-b21285fb1d9694` -> `https://web.klokah.tw/ninew/sound/04/03/08-C-1-15.mp3`
- `puyuma-audio-88f5c035b34c02` -> `https://web.klokah.tw/ninew/sound/04/05/08-C-1-9.mp3`
- `puyuma-audio-d5190f76270d57` -> `https://web.klokah.tw/ninew/sound/04/07/01-C-1-1.mp3`
- `puyuma-audio-f3af11a27d5329` -> `https://web.klokah.tw/ninew/sound/04/07/07-C-2-8.mp3`
- `puyuma-audio-5a555599689372` -> `https://web.klokah.tw/ninew/sound/04/08/04-C-7-8.mp3`
- `puyuma-audio-2ec0867aefe12a` -> `https://klokah.tw/extension/con_data/sound/41/sentence/41c5s4.mp3`
- `puyuma-audio-9797d9e881abd5` -> `https://klokah.tw/extension/con_data/sound/41/sentence/41c18s9.mp3`

## Local Evidence Files

- `../artifacts/puyuma_audio_mp3_package_hf_report.json`
- `../artifacts/puyuma_audio_source_gap_report.md`
- `../artifacts/puyuma_audio_source_gap_report.json`
- `../artifacts/puyuma_full_corpus_hf_audio_report.json`
