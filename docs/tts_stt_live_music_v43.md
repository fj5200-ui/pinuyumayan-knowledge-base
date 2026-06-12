# v43 TTS/STT Live Music Ops

- YouTube metadata may be collected; YouTube audio/video must not be downloaded.
- Unlicensed songs must not be used for TTS/STT training.
- Public TTS/STT remains disabled until license, speaker consent, alignment, MOS/WER/CER and human review pass.

```bash
./deploy/vps-tts-stt-v43.sh
IMPORT_SQL=1 DATABASE_URL="$DATABASE_URL" ./deploy/vps-tts-stt-v43.sh
```
