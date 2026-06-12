# v29 後台實際營運 Dashboard

建議主站後台加入：

```tsx
import { AdminVpsActualOpsDashboardV29 } from '@/components/AdminVpsActualOpsDashboardV29';

export default function Page() {
  return <AdminVpsActualOpsDashboardV29 />;
}
```

要顯示：

- VPS DB readiness
- full corpus execution runs
- search index population runs
- production fallback route coverage
- backup restore checksum reports
- source candidate reviews

若 `full corpus total_entries < 1000`，頁面要明確顯示失敗，不可標示完成。
