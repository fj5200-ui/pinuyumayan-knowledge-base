#!/usr/bin/env python3
"""Export website-ready Puyuma/Pinuyumayan audio vocabulary from the seed manifest."""
from __future__ import annotations
import argparse, json, pathlib, re

COMMIT = "604a1074b6ea5685365defd8cfd043f3f10aaecb"
PLATFORM_KEYS = {"Nanwang_Puyuma":"puyuma","Zhiben_Puyuma":"katratripulr","Xiqun_Puyuma":"ulivelivek","Jianhe_Puyuma":"kasavakan"}
COMMUNITIES = {"Nanwang_Puyuma":"南王","Zhiben_Puyuma":"知本","Xiqun_Puyuma":"西群／初鹿系","Jianhe_Puyuma":"建和"}
LABELS = {"greeting":"問候語","classroom_school":"教室與學校","family_community":"家庭與部落","daily_conversation":"日常會話"}

def cat(category: str, zh: str, form: str) -> str:
    text = f"{category} {zh} {form}"
    if any(k in text for k in ["你好","大家好","早安","Hello","inabayan","semavalran"]): return "greeting"
    if any(k in text for k in ["老師","上課","起立","敬禮","學校","族語","請"]): return "classroom_school"
    if any(k in text for k in ["爸爸","媽媽","母親","父親","家","部落"]): return "family_community"
    return "daily_conversation"

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--seed', default='data/generated/puyuma_audio_seed.json')
    ap.add_argument('--out', default='data/web/puyuma_vocabulary_audio_entries.json')
    args = ap.parse_args()
    seed = json.loads(pathlib.Path(args.seed).read_text(encoding='utf-8'))['entries']
    out_entries = []
    for i, e in enumerate(seed, 1):
        key = cat(e['category'], e['chinese'], e['form'])
        dialect = e['dialect']
        out_entries.append({
            'id': f'puyuma-audio-{i:04d}', 'legacy_seed_id': e['id'], 'type': 'sentence_audio',
            'language': {'ethnic_group_zh':'卑南族','ethnic_group_romanized':'Pinuyumayan','language_zh':'卑南語','language_en':'Puyuma language','dialect_code':e['dialect_code'],'dialect_name':dialect,'dialect_zh':e['dialect_zh'],'platform_key':PLATFORM_KEYS.get(dialect, dialect),'community_label_zh':COMMUNITIES.get(dialect, e['dialect_zh'])},
            'category': {'source_category':e['category'],'website_category_key':key,'website_category_label_zh':LABELS[key]},
            'text': {'puyuma_form':e['form'],'zh_tw':e['chinese'],'en':e.get('english','')},
            'audio': {'url':e['audio_url'],'mime_type':'audio/mpeg','storage_mode':'remote_url','provider':'Klokah/ePark public audio URL indexed through FormosanBank','local_file_included':False,'website_playback':{'html_audio_controls':True,'preload':'none','cross_origin':'anonymous','fallback_text_zh':'音檔暫時無法播放，請稍後再試。'}},
            'source': {'source_id':'formosanbank_epark','repository':'FormosanBank/FormosanBank','commit':COMMIT,'source_path':e['source_path'],'source_format':'csv','verification_status':'verified_public_source','license_review_required_before_commercial_use':True},
            'website': {'status':'ready_for_public_preview','route':f"/language/puyuma/audio/puyuma-audio-{i:04d}",'card_title_zh':f"{e['dialect_zh']}｜{e['chinese']}",'seo_title_zh':f"{e['chinese']}－{e['dialect_zh']}語音學習",'search_keywords_zh':[e['dialect_zh'], COMMUNITIES.get(dialect,''), e['category'], e['chinese']],'filters':{'dialect':dialect,'dialect_code':e['dialect_code'],'category':key,'has_audio':True}},
            'sensitivity':'public','review_status':'approved_for_public_learning'
        })
    pathlib.Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(args.out).write_text(json.dumps({'version':'generated','entry_count':len(out_entries),'entries':out_entries}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'exported {len(out_entries)} entries to {args.out}')

if __name__ == '__main__': main()
