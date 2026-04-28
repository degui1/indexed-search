# indexed-search

A CLI tool for studying and benchmarking indexed search algorithms. Index a directory, then run interactive searches while measuring build time, search time, and memory usage per algorithm.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Usage

```bash
npm start -- <path> [options]
```

| Option | Description |
|---|---|
| `--algorithm <name>` | Override the algorithm set in `config.json` |
| `--no-recursive` | Index only the top-level directory |

**Examples:**

```bash
# Index current directory using the configured algorithm
npm start -- .

# Index a specific path recursively
npm start -- ./documents

# Override algorithm at runtime
npm start -- ./documents --algorithm inverted-index

# Non-recursive
npm start -- ./documents --no-recursive
```

Once the index is built, an interactive prompt appears. Type a search term and press Enter. Type `exit` or `quit` to close.

```
search> hello world
search> exit
```

## Configuration

Edit `config.json` to set defaults:

```json
{
  "algorithm": "linear",
  "recursive": true,
  "extensions": ["txt", "md", "js", "ts", "json", "html", "css"],
  "maxFileSizeBytes": 1048576
}
```

| Field | Description |
|---|---|
| `algorithm` | Which engine to use (`linear`, `inverted-index`, `trie`, `tfidf`) |
| `recursive` | Whether to crawl subdirectories |
| `extensions` | File types to include |
| `maxFileSizeBytes` | Files larger than this are skipped (default: 1 MB) |

## Algorithms

Each algorithm is implemented in `src/algorithms/`. They all share the same interface:

```typescript
interface SearchEngine {
  build(entries: FileEntry[]): void   // build the index
  search(term: string): SearchResult[] // query the index
}
```

Searches run against both file name and file content.

| Algorithm | File | Status |
|---|---|---|
| Linear Search | `src/algorithms/linear.ts` | - |
| Inverted Index | `src/algorithms/inverted-index.ts` | - |
| Trie | `src/algorithms/trie.ts` | - |
| TF-IDF | `src/algorithms/tfidf.ts` | - |

## Known Improvements

### Linear Search — Score model

The current scoring in [src/algorithms/linear.ts](src/algorithms/linear.ts) uses a raw occurrence counter that increments for every match found:

```
score = 1 (name match) + number of content occurrences
```

This has two conceptual problems:

**1. No field weight.** A match in the file name signals higher relevance than a mention buried inside the content. The score should reflect this distinction by assigning a higher base weight to name matches.

**2. No length normalization.** A large file will naturally produce more occurrences than a small one — not because it is more relevant, but simply because it has more text. Dividing by total word count removes this bias.

A more meaningful formula:

```
score = (name_match ? name_weight : 0) + (occurrences / total_words)
```

This is the core intuition behind **TF-IDF**, which is already one of the available algorithms. The linear score could adopt a simplified version of that concept so that results are sorted by actual relevance rather than raw count.

## Performance Output

After indexing, the CLI prints:

```
✓ Indexed 42 file(s)
  Build  : 3.21 ms
  Memory : +1.4 KB
```

After each search:

```
Search : 0.043 ms — 5 result(s)
```
