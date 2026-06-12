#!/usr/bin/env python3
import argparse, json, pathlib, hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--input', default='data/audio/tts_stt_training_manifest_v41.json')
    ap.add_argument('--out', default='data/audio/tts_stt_training_acceptance_v41.generated.json')
    args=ap.parse_args()
    data=json.loads((ROOT/args.input).read_text(encoding='utf-8'))
    items=data.get('items',[])
    blocked=[i for i in items if not (i.get('allowed_for_tts_training') or i.get('allowed_for_stt_training'))]
    report={'version':'v41','input':args.input,'total_items':len(items),'train_ready_items':len(items)-len(blocked),'blocked_items':len(blocked),'status':'failed' if blocked else 'passed','reason':'preview candidates are not license/alignment reviewed' if blocked else 'all items ready','no_youtube_audio':data.get('safety_flags',{}).get('no_youtube_audio') is True}
    (ROOT/args.out).parent.mkdir(parents=True, exist_ok=True); (ROOT/args.out).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__': main()
