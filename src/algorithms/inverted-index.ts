import type { SearchEngine, FileEntry, SearchResult } from "../core/types.js";

export class InvertedIndex implements SearchEngine {
  build(entries: FileEntry[]): void {
    throw new Error("InvertedIndex not implemented");
  }

  search(term: string): SearchResult[] {
    throw new Error("InvertedIndex not implemented index");
  }
}
