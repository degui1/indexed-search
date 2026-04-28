import type { SearchEngine, FileEntry, SearchResult } from "../core/types.js";

export class TrieSearch implements SearchEngine {
  build(entries: FileEntry[]): void {
    throw new Error("TrieSearch not implemented");
  }

  search(term: string): SearchResult[] {
    throw new Error("TrieSearch not implemented");
  }
}
