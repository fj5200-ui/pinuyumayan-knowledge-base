# v34 Source Harvest Worker

此 worker 只負責把多來源搜尋結果寫入候選區。

## 階段

1. search
2. fetch metadata
3. forbidden relation filter
4. license check
5. duplicate check
6. candidate claim extraction
7. human review
8. public summary release

任何 candidate 預設不可公開，也不可進入前端 AI source packet。
