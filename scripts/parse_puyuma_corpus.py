#!/usr/bin/env python3
"""
parse_puyuma_corpus.py
=======================

卑南族語語料庫解析 + 音檔對應工具。

本腳本做兩件事：
  1. 從 FormosanBank GitHub repo（https://github.com/FormosanBank/FormosanBank）
     下載/更新並解析卑南語（Puyuma）四方言語料庫 XML，輸出結構化 JSON。
  2. 將解析出的詞彙／例句與 Google Drive 上的卑南族語音檔資料夾建立對應關係，
     特別是 ILRDF 字典音檔資料夾（檔名格式 Puyuma_XXXX.mp3）。

------------------------------------------------------------------------------
環境需求
------------------------------------------------------------------------------
- 需要網路連線（git clone GitHub repo、存取 Google Drive）。
- 必要套件：
    pip install -r requirements.txt
  （git 通常系統內建；若無則需另外安裝）

------------------------------------------------------------------------------
使用方式
------------------------------------------------------------------------------
1) 下載/更新 FormosanBank 語料庫原始碼：
    python3 parse_puyuma_corpus.py fetch-repo

2) 解析某類別語料（預設輸出至 data/generated/puyuma_<category>.json）：
    python3 scripts/parse_puyuma_corpus.py parse vocab
    python3 scripts/parse_puyuma_corpus.py parse vocab data/generated/my_vocab.json

   可用類別 key 請見下方 CATEGORIES。

3) 列出 Google Drive 音檔資料夾內容（需要 gdown）：
    python3 scripts/parse_puyuma_corpus.py list-audio ILRDF

4) 將語料 JSON 與 Google Drive 音檔對應，輸出含 audio_file 欄位的 JSON：
    python3 scripts/parse_puyuma_corpus.py match-audio data/generated/puyuma_vocab.json data/generated/puyuma_vocab_with_audio.json

------------------------------------------------------------------------------
重要備註
------------------------------------------------------------------------------
- ILRDF 字典音檔（資料夾 ID 1o_iEc2dbet-cENHLjv86R_b67M0TlakZ）檔名格式為
  `Puyuma_XXXX.mp3`，XXXX 為 ILRDF 字典詞條編號，**與 FormosanBank XML 內的
  `id` 屬性不一定相同**。本腳本提供的 match-audio 功能會先嘗試「精確比對
  音檔檔名中的數字編號」與「語料中標註的 ILRDF 編號（如有）」；若語料 XML
  本身未標註 ILRDF 編號，會改以「卑南語詞彙字串」做模糊比對，並將比對結果
  的信心程度（exact / fuzzy / none）一併輸出，方便人工複查。
- 第一次執行 match-audio 前，務必先執行 list-audio 產生本機音檔清單快取，
  避免每次比對都重新呼叫 Google Drive。
"""

import argparse
import json
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

# ------------------------------------------------------------------
# 設定區
# ------------------------------------------------------------------

XML_NS = '{http://www.w3.org/XML/1998/namespace}'

# FormosanBank GitHub repo
REPO_URL = os.getenv("FORMOSANBANK_REPO_URL", "https://github.com/FormosanBank/FormosanBank.git")
DEFAULT_REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "external", "FormosanBank"))
REPO_DIR = os.getenv("FORMOSANBANK_REPO_DIR", DEFAULT_REPO_DIR)

# 卑南語 XML 語料庫位置（clone 下來之後的相對路徑，依 repo 實際結構可能需微調）
CORPUS_BASE = os.getenv("PUYUMA_CORPUS_BASE", os.path.join(REPO_DIR, "Corpora", "ePark", "XML"))
DIALECTS = ['Nanwang', 'Zhiben', 'Jianhe', 'Xiqun']

CATEGORIES = {
    'vocab': 'xue_xi_ci_biao_learning_vocabulary',
    'culture': 'wen_hua_pian_cultural_section',
    'conversation': 'sheng_huo_hui_hua_pian_daily_conversation',
    'contextual': 'qing_jing_zu_yu_contextual_indigenous_language',
    'reading': 'yue_du_shu_xie_pian_reading_writing',
    'sentence_senior': 'ju_xing_pian_gao_zhong_sentence_patterns_senior_high',
    'sentence_junior': 'ju_xing_pian_guo_zhong_sentence_patterns_junior_high',
    'nine_level': 'jiu_jie_jiao_cai_nine_level_materials',
    'essay': 'zu_yu_duan_wen_indigenous_language_essays',
    'picture_story': 'tu_hua_gu_shi_pian_picture_story',
}

# Google Drive 音檔資料夾（卑南語 / Puyuma language）
GDRIVE_ROOT_FOLDER_ID = "1mdzXxD5XQAVLIAdrD5xy3iRI7B3XnlUo"
GDRIVE_FOLDERS = {
    'ep1_九階教材': "1_Tq3vumPRAOPvIxZPHfBsQ3O9SVufH0d",
    'ep2_文化篇': "1U8yvI1jaLRAlE9nJZoxOI_YnpXP3SKw7",
    'ep2_生活會話篇': "1vKRsHvyprVDfAjBX057OvCnjDwU3FzRS",
    'ep2_情境族語': "1HdsHtjsKRMdS6N7GWgIixfG_VUnV-8_X",
    'ep2_閱讀書寫篇': "1HJbFL8y6ZjdI0Vc3MbXFm9X32MJqkMb9",
    'ep2_族語短文': "1BwBcThAEAVQrOqjHlLDycgsM0b5LCAzV",
    'ILRDF': "1o_iEc2dbet-cENHLjv86R_b67M0TlakZ",
}

AUDIO_LIST_CACHE = os.getenv("PUYUMA_AUDIO_CACHE", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", ".puyuma_audio_cache.json")))


# ------------------------------------------------------------------
# 1. 抓取 / 更新 FormosanBank repo
# ------------------------------------------------------------------

def fetch_repo():
    """git clone 或 pull FormosanBank repo。"""
    if os.path.isdir(os.path.join(REPO_DIR, ".git")):
        print(f"[fetch-repo] repo 已存在，執行 git pull：{REPO_DIR}")
        subprocess.run(["git", "-C", REPO_DIR, "pull"], check=True)
    else:
        print(f"[fetch-repo] clone {REPO_URL} -> {REPO_DIR}")
        subprocess.run(["git", "clone", "--depth", "1", REPO_URL, REPO_DIR], check=True)

    if not os.path.isdir(CORPUS_BASE):
        print(f"[fetch-repo][警告] 預期的語料路徑不存在: {CORPUS_BASE}")
        print("            請手動確認 repo 內實際的 XML 語料路徑，並更新 CORPUS_BASE 設定。")
        # 嘗試自動搜尋
        for root, dirs, files in os.walk(REPO_DIR):
            if any(f.endswith("_Puyuma.xml") for f in files):
                print(f"[fetch-repo][提示] 找到可能的卑南語語料目錄: {root}")


# ------------------------------------------------------------------
# 2. 解析語料 XML
# ------------------------------------------------------------------

def parse_xml(filepath, dialect):
    tree = ET.parse(filepath)
    root = tree.getroot()
    results = []
    for s in root.findall('.//S'):
        form = s.find('FORM[@kindOf="original"]')
        phon = s.find('PHON[@kindOf="original"]')
        zh = s.find(f'TRANSL[@{XML_NS}lang="zh"]')
        en = s.find(f'TRANSL[@{XML_NS}lang="en"]')
        audio = s.find('AUDIO')
        if form is not None and zh is not None:
            results.append({
                'id': s.get('id'),
                'dialect': dialect,
                'puyuma': (form.text or '').strip(),
                'phonetic': (phon.text or '').strip() if phon is not None else '',
                'chinese': (zh.text or '').strip(),
                'english': (en.text or '').strip() if en is not None else '',
                'audio_url': audio.get('url', '') if audio is not None else '',
            })
    return results


def export_category(category_key, output_path=None):
    cat_dir = CATEGORIES.get(category_key, category_key)
    all_data = []
    for dialect in DIALECTS:
        fp = os.path.join(CORPUS_BASE, cat_dir, 'Puyuma', f'{dialect}_Puyuma.xml')
        if os.path.exists(fp):
            entries = parse_xml(fp, dialect)
            all_data.extend(entries)
            print(f'  {dialect}: {len(entries)} entries')
        else:
            print(f'  {dialect}: 找不到檔案 {fp}')
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
        print(f'已儲存 {len(all_data)} 筆資料 -> {output_path}')
    return all_data


# ------------------------------------------------------------------
# 3. Google Drive 音檔列表
# ------------------------------------------------------------------

def list_audio_folder(folder_key, refresh=False):
    """
    使用 gdown 列出 Google Drive 資料夾內檔案清單。
    folder_key 可以是 GDRIVE_FOLDERS 的 key（如 'ILRDF'）或直接給 folder ID。
    結果會快取在 AUDIO_LIST_CACHE，避免重複呼叫。
    """
    folder_id = GDRIVE_FOLDERS.get(folder_key, folder_key)

    cache = {}
    if os.path.exists(AUDIO_LIST_CACHE):
        with open(AUDIO_LIST_CACHE, encoding='utf-8') as f:
            cache = json.load(f)

    if folder_id in cache and not refresh:
        return cache[folder_id]

    try:
        import gdown
    except ImportError:
        print("[list-audio] 缺少 gdown，請先執行：pip install gdown --break-system-packages")
        sys.exit(1)

    print(f"[list-audio] 列出資料夾 {folder_key} ({folder_id}) ...")
    # gdown 的資料夾下載會列出檔名與 file id；這裡用 download_folder 的 dry-run 模式取得清單
    file_list = gdown.download_folder(
        id=folder_id, skip_download=True, quiet=False
    )
    files = []
    for item in file_list or []:
        # gdown 回傳物件通常含 .path / .id（依版本可能不同，做容錯處理）
        name = getattr(item, "path", None) or getattr(item, "local_path", None) or str(item)
        file_id = getattr(item, "id", "")
        files.append({"name": os.path.basename(str(name)), "id": file_id})

    cache[folder_id] = files
    os.makedirs(os.path.dirname(os.path.abspath(AUDIO_LIST_CACHE)), exist_ok=True)
    with open(AUDIO_LIST_CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    print(f"[list-audio] 共 {len(files)} 個檔案，已寫入快取 {AUDIO_LIST_CACHE}")
    return files


# ------------------------------------------------------------------
# 4. 語料 <-> 音檔 對應
# ------------------------------------------------------------------

ILRDF_FILENAME_RE = re.compile(r'Puyuma_(\d+)\.mp3', re.IGNORECASE)


def match_audio(corpus_json_path, output_path, audio_folder_key='ILRDF'):
    """
    將語料 JSON（export_category 的輸出）與 Google Drive 音檔資料夾比對，
    輸出每筆資料新增的欄位：
      - matched_audio_file: 比對到的檔名（找不到則為 null）
      - match_confidence: "exact" | "fuzzy" | "none"
    """
    with open(corpus_json_path, encoding='utf-8') as f:
        entries = json.load(f)

    audio_files = list_audio_folder(audio_folder_key)

    # 建立「編號 -> 檔名」索引
    id_index = {}
    for af in audio_files:
        m = ILRDF_FILENAME_RE.match(af['name'])
        if m:
            id_index[m.group(1)] = af['name']

    # 建立「卑南語字串 -> 檔名」的簡易索引（用於 fuzzy fallback）
    # 注意：ILRDF 音檔檔名通常不含詞彙字串，此索引多半為空，
    # 保留此邏輯是為了未來若取得含詞彙資訊的檔名清單時可直接套用。
    text_index = {}
    for af in audio_files:
        stem = os.path.splitext(af['name'])[0]
        text_index[stem.lower()] = af['name']

    matched = 0
    for e in entries:
        e['matched_audio_file'] = None
        e['match_confidence'] = 'none'

        # 1) 嘗試用語料本身的 id（若剛好等同 ILRDF 編號）
        eid = str(e.get('id', '')).lstrip('0') or '0'
        if eid in id_index:
            e['matched_audio_file'] = id_index[eid]
            e['match_confidence'] = 'exact'
            matched += 1
            continue

        # 2) 嘗試用卑南語字串模糊比對檔名（多數情況找不到，保留邏輯供未來擴充）
        key = (e.get('puyuma') or '').strip().lower()
        if key and key in text_index:
            e['matched_audio_file'] = text_index[key]
            e['match_confidence'] = 'fuzzy'
            matched += 1

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"[match-audio] 共 {len(entries)} 筆，成功比對 {matched} 筆，"
          f"已輸出 -> {output_path}")
    print("[match-audio][提醒] 若 exact 比對數量很低，代表 ILRDF 編號規則與語料 id 不同，"
          "建議人工抽樣核對 Google Drive 音檔內容後，調整本腳本的比對邏輯。")


# ------------------------------------------------------------------
# CLI
# ------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="卑南族語語料庫解析與音檔對應工具")
    sub = parser.add_subparsers(dest='command', required=True)

    sub.add_parser('fetch-repo', help='clone/更新 FormosanBank repo')

    p_parse = sub.add_parser('parse', help='解析指定類別語料為 JSON')
    p_parse.add_argument('category', choices=list(CATEGORIES.keys()),
                          help=f"類別: {', '.join(CATEGORIES.keys())}")
    p_parse.add_argument('output', nargs='?', default=None, help='輸出 JSON 路徑')

    p_list = sub.add_parser('list-audio', help='列出 Google Drive 音檔資料夾')
    p_list.add_argument('folder', help=f"資料夾 key 或 Drive ID，可用 key: {', '.join(GDRIVE_FOLDERS.keys())}")
    p_list.add_argument('--refresh', action='store_true', help='強制重新抓取，不使用快取')

    p_match = sub.add_parser('match-audio', help='將語料 JSON 與音檔比對')
    p_match.add_argument('corpus_json', help='輸入語料 JSON（parse 指令的輸出）')
    p_match.add_argument('output_json', help='輸出含比對結果的 JSON')
    p_match.add_argument('--folder', default='ILRDF', help='音檔資料夾 key（預設 ILRDF）')

    args = parser.parse_args()

    if args.command == 'fetch-repo':
        fetch_repo()
    elif args.command == 'parse':
        out = args.output or os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'generated', f'puyuma_{args.category}.json'))
        print(f'解析類別: {args.category}')
        export_category(args.category, out)
    elif args.command == 'list-audio':
        files = list_audio_folder(args.folder, refresh=args.refresh)
        for f in files[:20]:
            print(f"  {f['name']}  (id={f['id']})")
        if len(files) > 20:
            print(f"  ... 共 {len(files)} 個檔案")
    elif args.command == 'match-audio':
        match_audio(args.corpus_json, args.output_json, audio_folder_key=args.folder)


if __name__ == '__main__':
    main()
