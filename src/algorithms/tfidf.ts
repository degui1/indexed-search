import type { SearchEngine, FileEntry, SearchResult } from "../core/types.js";

export class TfIdfSearch implements SearchEngine {
  build(entries: FileEntry[]): void {
    throw new Error("TfIdfSearch not implemented");
  }

  search(term: string): SearchResult[] {
    throw new Error("TfIdfSearch not implemented");
  }
}
