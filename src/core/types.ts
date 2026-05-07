export interface FileEntry {
  path: string;
  name: string;
  content: string;
  size: number;
}

export interface SearchMatch {
  field: "name" | "content";
  positions: number[];
}

export interface SearchResult {
  file: FileEntry;
  score: number;
  matches: SearchMatch[];
}

export interface PerformanceMetrics {
  buildTimeMs: number;
  searchTimeMs: number;
  memoryDeltaBytes: number;
  fileCount: number;
}

export interface SearchEngine {
  build(entries: FileEntry[]): void;
  search(term: string): SearchResult[];
}

export interface Config {
  algorithm: "linear" | "inverted-index" | "trie" | "tfidf";
  recursive: boolean;
  extensions: string[];
  maxFileSizeBytes: number;
}
