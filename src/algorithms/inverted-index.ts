import type { SearchEngine, FileEntry, SearchResult, SearchMatch } from "../core/types.js";

type SearchMap = Map<string, SearchMatch[]>;

type WordsMap = Map<string, SearchMap>;

export class InvertedIndex implements SearchEngine {
  private words: WordsMap = new Map();
  private files: Map<string, FileEntry> = new Map();

  mapper(content: string, path: string, matchField: SearchMatch["field"]) {
    const regexp = /[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|\d+/g;
    let match: RegExpExecArray | null;

    while ((match = regexp.exec(content)) !== null) {
      const word = match[0].toLowerCase();
      const position = match.index;

      let wordMapped = this.words.get(word);

      if (!wordMapped) {
        wordMapped = new Map() as SearchMap;
        this.words.set(word, wordMapped);
      }

      let matches = wordMapped.get(path);

      if (!matches) {
        matches = [];
        wordMapped.set(path, matches);
      }

      const matchIndex = matches.findIndex(({ field }) => field === matchField);

      if (matchIndex === -1) {
        matches.push({ field: matchField, positions: [position] });

        continue;
      }

      matches[matchIndex].positions.push(position);
    }
  }

  build(entries: FileEntry[]): void {
    for (const entry of entries) {
      const { content, path, name } = entry;

      this.files.set(path, entry);

      this.mapper(name, path, "name");
      this.mapper(content, path, "content");
    }
  }

  search(term: string): SearchResult[] {
    if (!term.trim()) {
      return [];
    }

    const match = this.words.get(term.toLowerCase());
    if (!match) return [];

    const searchResult: SearchResult[] = [];

    for (const [path, matches] of match) {
      const file = this.files.get(path)!;

      const score = matches.reduce((previousValue, { positions }) => {
        return previousValue + positions.length;
      }, 0);

      searchResult.push({ file, matches: matches, score });
    }

    return searchResult;
  }
}
