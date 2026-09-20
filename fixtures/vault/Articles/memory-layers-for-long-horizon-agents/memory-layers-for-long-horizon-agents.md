---
description: Memory-layer in agentic engineering for long-run agentic system
created: 2026-09-01
tags: [agents, memory]
---

# Memory Layers for Long-Horizon Agents

There are three memory problems wearing one coat: what happened, what it meant, and what is still true. Collapsing them into one store is why retrieval feels clever and behaves badly three weeks later.

## The three layers

Keep them apart and the system stays debuggable; collapse them and every failure looks like retrieval.

- **Event memory** records what happened, verbatim and append-only.
- **Meaning memory** records what events were like to act on.
- **State memory** records what is still true right now.

> A bench, not a warehouse: working memory should hold only what the current task laid there.

> [!note]
> A layer that cannot be rebuilt from raw events is not memory, it is debt. The rebuild run is the test.

Similarity answers *how alike*, never *how current*, so ranking pays a recency tax before anything else:

$$
r(q, d) = \cos(q, d) \cdot e^{-\Delta t / \tau}
$$

with the half-life $\tau$ kept short by design.

| Layer   | Written when  | Decays    |
| ------- | ------------- | --------- |
| Event   | every session | never     |
| Meaning | on reflection | slowly    |
| State   | every query   | by demand |

## What compounds

Meaning memory is the only layer that compounds, and it compounds through writing, not reading. A year of notes beats a year of embeddings; see [[wiki-as-shared-memory-one-year-in]].

### The pruning pass

State memory is garbage-collected on demand, not on schedule:

```sh
# keep only what the resolver can still justify
vault gc --layer state --max-age 30d
```

Long-horizon agents do not need bigger notebooks. They need rooms they can walk back into.
