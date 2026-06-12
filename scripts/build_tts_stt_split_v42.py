#!/usr/bin/env python3
import argparse, json, pathlib, hashlib, random
p=argparse.ArgumentParser(); p.add_argument('--input', default='data/web/puyuma_vocabulary_audio_entries.json'); p.add_argument('--out', default='data/audio/tts_stt_split_v42.generated.json'); p.add_argument('--seed', type=int, default=42); args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
items=json.loads((root/args.input).read_text(encoding='utf-8'))
if isinstance(items, dict): items=items.get('entries') or items.get('items') or []
# Only license/consent approved items can be split. Preview corpus has no training authorization by default.
approved=[x for x in items if x.get('license_status')=='approved_for_training' and x.get('speaker_consent_status')=='approved' and x.get('alignment_status')=='aligned']
random.seed(args.seed); random.shuffle(approved)
n=len(approved); train=approved[:int(n*.8)]; dev=approved[int(n*.8):int(n*.9)]; test=approved[int(n*.9):]
out={'version':'v42','input':args.input,'counts':{'input_items':len(items),'approved_items':n,'train':len(train),'dev':len(dev),'test':len(test),'blocked':len(items)-n},'split_hash':hashlib.sha256(json.dumps([x.get('id') or x.get('entry_id') for x in approved],sort_keys=True).encode()).hexdigest(),'train':train,'dev':dev,'test':test}
(root/args.out).parent.mkdir(parents=True, exist_ok=True); (root/args.out).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
print(json.dumps(out['counts'], ensure_ascii=False))
