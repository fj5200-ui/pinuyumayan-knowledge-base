# v20 前端 AI 發文與去重流程

文章生成位置：前端。

後端職責：

```txt
source packet resolve
citation check
duplicate check
sensitivity check
license/public_use check
review queue
publish gate
```

前端流程：

```txt
使用者輸入想法
→ 選 source packet / blueprint
→ 前端呼叫 AI provider
→ 顯示引用 claim/source
→ 送後端 client-draft/validate
→ duplicate-check
→ submit-review
→ 後台審核後發布
```

發布阻擋條件：

- 相同 slug
- 相同 claim set hash
- 相同 canonical fingerprint
- 高敏感 claim 未加 guardrail
- 引用來源缺失
- 把使用者想法寫成史實
