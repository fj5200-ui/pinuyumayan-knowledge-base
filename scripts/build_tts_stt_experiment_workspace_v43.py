#!/usr/bin/env python3
import json, pathlib, argparse
parser=argparse.ArgumentParser(); parser.add_argument("--out", default="data/audio/model_experiment_workspace_v43.generated.json"); args=parser.parse_args()
root=pathlib.Path.cwd(); data=json.loads((root/"data/audio/model_experiment_workspace_v43.json").read_text(encoding="utf-8")); data["generated"]=True
out=root/args.out; out.parent.mkdir(parents=True, exist_ok=True); out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(f"wrote {out}")
