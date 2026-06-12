# v33 下一步：Live DB Transaction and Dashboard Binding

v33 要把 v32 的 report-only POST 端點改成真正寫入 VPS DB transaction，並讓後台 dashboard 使用登入後的 live API 顯示結果。

優先順序：
1. report POST 寫 DB transaction。
2. 後台 dashboard 接 live API + RBAC。
3. nonce store 改成 MySQL 或 Redis。
4. 主站實際搬移並跑 secret scan。
5. VPS staging 實跑 full corpus。
