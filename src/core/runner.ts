import type { SearchEngine, SearchResult, FileEntry } from "./types.js";

export function measureBuild(
  engine: SearchEngine,
  entries: FileEntry[]
): { buildTimeMs: number; memoryDeltaBytes: number; fileCount: number } {
  engine.build(entries);

  return {
    buildTimeMs: 0,
    fileCount: entries.length,
    memoryDeltaBytes: 0,
  };
}

export function measureSearch(
  engine: SearchEngine,
  term: string
): { results: SearchResult[]; searchTimeMs: number } {
  const results = engine.search(term);

  return { results, searchTimeMs: 0 };
}

// --- example ---
//
// export function measureBuild(engine, entries) {
//   const memBefore = process.memoryUsage().heapUsed
//   const start = process.hrtime.bigint()
//
//   engine.build(entries)
//
//   const buildTimeMs = Number(process.hrtime.bigint() - start) / 1_000_000
//   const memoryDeltaBytes = process.memoryUsage().heapUsed - memBefore
//   return { buildTimeMs, memoryDeltaBytes, fileCount: entries.length }
// }
//
// export function measureSearch(engine, term) {
//   const start = process.hrtime.bigint()
//   const results = engine.search(term)
//   const searchTimeMs = Number(process.hrtime.bigint() - start) / 1_000_000
//   return { results, searchTimeMs }
// }
