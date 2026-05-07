import type { SearchEngine, FileEntry, SearchResult } from "../core/types.js";

export class LinearSearch implements SearchEngine {
  private entries: FileEntry[] = [];

  build(entries: FileEntry[]): void {
    this.entries = [...entries];
  }

  search(term: string): SearchResult[] {
    const mapOfResults: Map<FileEntry["path"], SearchResult> = new Map();

    const normalizedTerm = term.toLowerCase();

    if (!term.trim()) {
      return [];
    }

    for (const entry of this.entries) {
      const normalizedName = entry.name.toLowerCase();
      const normalizedContent = entry.content.toLowerCase();

      let position = 0;
      let score = 1;

      if ((position = normalizedName.indexOf(normalizedTerm)) !== -1) {
        mapOfResults.set(entry.path, {
          file: entry,
          score,
          matches: [{ field: "name", positions: [position] }],
        });
        score++;
      }

      let lastPosition = 0;

      while ((position = normalizedContent.indexOf(normalizedTerm, lastPosition)) !== -1) {
        lastPosition = position + normalizedTerm.length;

        const result = mapOfResults.get(entry.path);

        if (result !== undefined) {
          const matchIndex = result.matches.findIndex(({ field }) => field === "content");

          if (matchIndex === -1) {
            result.matches.push({ field: "content", positions: [position] });
          } else {
            result.matches[matchIndex].positions.push(position);
          }

          mapOfResults.set(entry.path, {
            ...result,
            score,
          });
        } else {
          mapOfResults.set(entry.path, {
            file: entry,
            score,
            matches: [{ field: "content", positions: [position] }],
          });
        }

        score++;
      }
    }

    return [...mapOfResults.values()];
  }
}
