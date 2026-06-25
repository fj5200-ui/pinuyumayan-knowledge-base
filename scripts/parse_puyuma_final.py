import xml.etree.ElementTree as ET
import json
import os
import re

XML_NS = '{http://www.w3.org/XML/1998/namespace}'
BASE_EPARK = '/home/ubuntu/FormosanBank/Corpora/ePark/XML'
DICT_XML = '/home/ubuntu/FormosanBank/Corpora/ILRDF_Dicts/XML/Puyuma/Puyuma.xml'
PRES_XML = '/home/ubuntu/FormosanBank/Corpora/Presidential_Apologies/XML/Puyuma/Puyuma.xml'
DIALECTS = ['Nanwang', 'Zhiben', 'Jianhe', 'Xiqun']

SUB_CATEGORIES = {
    "01": "數量", "02": "代詞與指示詞", "03": "疑問句", "04": "親屬稱謂", "05": "身體部位",
    "06": "人物與職業", "07": "居家生活", "08": "建築與空間", "09": "服飾與飾物", "10": "食物與飲品",
    "11": "器物與工具", "12": "交通與通訊", "13": "動植物", "14": "自然現象與地理", "15": "時間與方位",
    "16": "抽象概念與情緒", "17": "動作與行為", "18": "性質與狀態", "19": "其他詞彙", "20": "句型-否定",
    "21": "句型-疑問", "22": "句型-祈使", "23": "句型-比較", "24": "句型-假設", "25": "句型-因果",
    "26": "句型-時態", "27": "句型-被動", "28": "句型-關係子句", "29": "文化-祭儀", "30": "文化-習俗",
    "31": "文化-傳說", "32": "文化-器物", "33": "文化-藝術", "34": "生活-購物", "35": "生活-醫療", "36": "生活-休閒"
}

def parse_xml(filepath, dialect, category_name):
    if not os.path.exists(filepath): return []
    tree = ET.parse(filepath)
    root = tree.getroot()
    results = []
    for s in root.findall('.//S'):
        form = s.find('FORM[@kindOf="original"]')
        phon = s.find('PHON[@kindOf="original"]')
        zh = s.find(f'TRANSL[@{XML_NS}lang="zho"]')
        if zh is None: zh = s.find(f'TRANSL[@{XML_NS}lang="zh"]')
        audio = s.find('AUDIO')
        if form is not None:
            audio_url = audio.get('url', '') if audio is not None else ''
            sub_cat = "一般"
            m = re.search(r'/(\d+)_(\d+)\.(wav|mp3)$', audio_url)
            if m: sub_cat = SUB_CATEGORIES.get(m.group(1), f"分類{m.group(1)}")
            
            results.append({
                'id': s.get('id'),
                'dialect': dialect,
                'category': category_name,
                'sub_category': sub_cat,
                'puyuma': (form.text or '').strip(),
                'ipa': (phon.text or '').strip() if phon is not None else '',
                'chinese': (zh.text or '').strip() if zh is not None else '',
                'audio_url': audio_url,
                'audio_file': audio.get('file', '') if audio is not None else '',
            })
    return results

all_data = []
CATEGORIES = {
    'xue_xi_ci_biao_learning_vocabulary': '學習詞表',
    'wen_hua_pian_cultural_section': '文化篇',
    'sheng_huo_hui_hua_pian_daily_conversation': '生活會話',
    'qing_jing_zu_yu_contextual_indigenous_language': '情境族語',
    'yue_du_shu_xie_pian_reading_writing': '閱讀書寫',
    'jiu_jie_jiao_cai_nine_level_materials': '九階教材',
    'zu_yu_duan_wen_indigenous_language_essays': '族語短文',
    'ju_xing_pian_gao_zhong_sentence_patterns_senior_high': '句型篇高中',
    'ju_xing_pian_guo_zhong_sentence_patterns_junior_high': '句型篇國中',
    'tu_hua_gu_shi_pian_picture_story': '圖畫故事'
}
for cat_dir, cat_name in CATEGORIES.items():
    for dialect in DIALECTS:
        fp = f'{BASE_EPARK}/{cat_dir}/Puyuma/{dialect}_Puyuma.xml'
        all_data.extend(parse_xml(fp, dialect, cat_name))

dict_entries = parse_xml(DICT_XML, 'Nanwang', 'ILRDF字典')
for d in dict_entries: d['sub_category'] = "字典詞彙"
all_data.extend(dict_entries)

pres_entries = parse_xml(PRES_XML, 'Nanwang', '總統府道歉文')
for d in pres_entries: d['sub_category'] = "政治/歷史"
all_data.extend(pres_entries)

with open('puyuma_final_v4.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)
print(f'Final Total: {len(all_data)}')
