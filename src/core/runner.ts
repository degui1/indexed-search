import type { SearchEngine, SearchResult, FileEntry } from "./types.js";

export function measureBuild(
  engine: SearchEngine,
  entries: FileEntry[]
): { buildTimeMs: number; memoryDeltaBytes: number; fileCount: number } {
  const memBefore = process.memoryUsage().heapUsed;
  const start = process.hrtime.bigint();

  engine.build(entries);

  const buildTimeMs = Number(process.hrtime.bigint() - start) / 1_000_000;
  const memoryDeltaBytes = process.memoryUsage().heapUsed - memBefore / 1_000_000;

  return {
    buildTimeMs,
    fileCount: entries.length,
    memoryDeltaBytes,
  };
}

export function measureSearch(
  engine: SearchEngine,
  term: string
): { results: SearchResult[]; searchTimeMs: number } {
  const start = process.hrtime.bigint();
  const results = engine.search(term);

  const searchTimeMs = Number(process.hrtime.bigint() - start) / 1_000_000;

  return { results, searchTimeMs };
}
