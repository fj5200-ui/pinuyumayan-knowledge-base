#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
root=Path.cwd()
search=json.loads((root/'data/search/music_search_formal_config_v58.json').read_text(encoding='utf-8'))
(root/'data/runtime').mkdir(exist_ok=True)
(root/'data/runtime/v58_search_formal_config.last.json').write_text(json.dumps({'version':'v58','features':len(search['features']),'live_metrics_attached':False,'rollback_ready':True},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('v58 search formal config decision: contract-only; waiting for live 24/72 metrics')
