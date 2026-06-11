# 卑南族十社名稱權威表（Tribe Name Authority）

> 本檔案為「卑南族文化綜合平台」處理部落名稱、十社分類、工程 key、AI 回答與資料庫 seed 的最高優先對照表。
> 若其他 reference 檔案有舊稱、異寫或歷史文獻用法，應以本表作為前台與資料庫的主用版本。

## 1. 使用原則

1. 平台正式分類一律使用「卑南族十社」。
2. 英文輔助標籤使用 **Pinuyumayan Ten Communities**，不得使用 **Pinuyumayan Ten Communities** 代稱全族十社。
3. **Pinuyumayan** 指卑南族整體；**Puyuma** 僅指南王部落，或在英文語境中指 **Puyuma language**（卑南語）。
4. 歷史文獻中的「八社」「八社番」可作為註解或資料來源語彙，但不得作為平台正式分類、UI 主標題、資料表名稱或 API 權限名稱。
5. 任何羅馬拼音異寫只能放在 `aliases`、註解或全文搜尋索引，不得覆蓋 `canonical_romanization`。

## 2. 十社主用表

| sort | 中文顯示名 | canonical_romanization | engineering_key | 起源系統 | 前台可顯示 | 備註 |
|---:|---|---|---|---|---|---|
| 1 | 南王 | Puyuma | `puyuma` | 竹生系統 | 是 | Puyuma 在本平台只指南王部落；不得代稱卑南族整體。 |
| 2 | 知本 | Katratripulr | `katratripulr` | 石生系統 | 是 | 常見異寫 Katipul、Katratipul、Katripul。 |
| 3 | 建和 | Kasavakan | `kasavakan` | 石生系統 | 是 | 常見異寫 Samagan。 |
| 4 | 利嘉 | Likavung | `likavung` | 石生系統 | 是 | 版圖歌或文獻中可能與 Alripay/Alipai 並列。 |
| 5 | 初鹿 | Ulivelivek | `ulivelivek` | 石生系統 | 是 | 常見異寫 Mulivelivek。 |
| 6 | 泰安 | Tamalakaw | `tamalakaw` | 石生系統 | 是 | 常見異寫 Tamalrakaw、Damalagaw。 |
| 7 | 下賓朗 | Pinaski | `pinaski` | 石生系統 | 是 | 常見異寫 Pinaseki。 |
| 8 | 龍過脈 | Danadanaw | `danadanaw` | 石生系統 | 是 | 文獻中可能與初鹿地區脈絡並列。 |
| 9 | 班鳩 | Rarangus | `rarangus` | 石生系統 | 是 | 舊整理常遺漏，平台必須列入。 |
| 10 | 寶桑 | Papulu | `papulu` | 竹生系統 | 是 | 常見異寫 Apapolo、Papulu。 |

## 3. 異名 / 舊稱 / 文獻異寫表

| 主用中文 | 主用羅馬拼音 | 可作搜尋 alias | 使用限制 |
|---|---|---|---|
| 南王 | Puyuma | Nanwang、卑南社、普悠瑪部落 | 可作部落別名；不可寫成「普悠瑪族」。 |
| 知本 | Katratripulr | Katipul、Katratipul、Katripul、Zhiben、知本社 | 可作歷史或全文搜尋 alias。 |
| 建和 | Kasavakan | Samagan、Jianhe、建和社 | 可作歷史或全文搜尋 alias。 |
| 利嘉 | Likavung | Likavong、Alripay、Alipai、Lijia、利嘉社 | 需視文獻脈絡標註。 |
| 初鹿 | Ulivelivek | Mulivelivek、Chulu、初鹿社 | 可作歷史或全文搜尋 alias。 |
| 泰安 | Tamalakaw | Tamalrakaw、Damalagaw、Taian、泰安社 | 可作歷史或全文搜尋 alias。 |
| 下賓朗 | Pinaski | Pinaseki、Pinarai、Xiabinglang、下賓朗社 | Pinarai 若指涉不同聚落脈絡需人工複核。 |
| 龍過脈 | Danadanaw | Longguomai、龍過脈社 | 可作歷史或全文搜尋 alias。 |
| 班鳩 | Rarangus | Banjou、班鳩社 | 平台正式十社不可省略。 |
| 寶桑 | Papulu | Apapolo、Baosang、寶桑社、巴布麓 | 可作部落別名。 |

## 4. 資料庫 seed 建議

```ts
export const pinuyumayanCommunities = [
  { sort: 1, name: '南王', romanization: 'Puyuma', key: 'puyuma', originSystem: '竹生系統' },
  { sort: 2, name: '知本', romanization: 'Katratripulr', key: 'katratripulr', originSystem: '石生系統' },
  { sort: 3, name: '建和', romanization: 'Kasavakan', key: 'kasavakan', originSystem: '石生系統' },
  { sort: 4, name: '利嘉', romanization: 'Likavung', key: 'likavung', originSystem: '石生系統' },
  { sort: 5, name: '初鹿', romanization: 'Ulivelivek', key: 'ulivelivek', originSystem: '石生系統' },
  { sort: 6, name: '泰安', romanization: 'Tamalakaw', key: 'tamalakaw', originSystem: '石生系統' },
  { sort: 7, name: '下賓朗', romanization: 'Pinaski', key: 'pinaski', originSystem: '石生系統' },
  { sort: 8, name: '龍過脈', romanization: 'Danadanaw', key: 'danadanaw', originSystem: '石生系統' },
  { sort: 9, name: '班鳩', romanization: 'Rarangus', key: 'rarangus', originSystem: '石生系統' },
  { sort: 10, name: '寶桑', romanization: 'Papulu', key: 'papulu', originSystem: '竹生系統' },
]
```
