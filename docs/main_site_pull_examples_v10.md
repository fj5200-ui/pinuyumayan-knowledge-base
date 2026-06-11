# Main Site Pull Examples v10

## Homepage

```ts
const bootstrap = await kb.bootstrap("zh-TW");
```

## Vocabulary page

```ts
const page = await kb.vocabulary({ dialectCode: "39", limit: 50 });
```

## Deployment readiness

```ts
const ready = await kb.readiness();
if (!ready.ready) throw new Error("Knowledge API is not ready");
```

## Trigger full corpus import

Only call this from a trusted backend job, not from the browser.

```ts
await kb.enqueueFullCorpusImport(1000);
```
