import type { SearchEngine, FileEntry, SearchResult } from "../core/types.js";

export class LinearSearch implements SearchEngine {
  private entries: FileEntry[] = [];

  build(entries: FileEntry[]): void {
    this.entries = entries;
  }

  search(term: string): SearchResult[] {
    const results: SearchResult[] = [];
    const mapOfResults: Map<FileEntry["path"], number> = new Map();

    for (let entry of this.entries) {
      const normalizedName = entry.name.toLowerCase();
      const normalizedContent = entry.content.toLowerCase();
      const normalizedTerm = term.toLowerCase();

      let position = 0;
      let score = 1;

      if ((position = normalizedName.indexOf(normalizedTerm)) !== -1) {
        results.push({ file: entry, score, matches: [{ field: "name", positions: [position] }] });
        mapOfResults.set(entry.path, results.length - 1);
        score++;
      }

      let lastPosition = 0;

      while ((position = normalizedContent.indexOf(normalizedTerm, lastPosition)) !== -1) {
        lastPosition = position + 1;

        let index = mapOfResults.get(entry.path);

        if (index !== undefined) {
          const result = results[index];

          const matchIndex = result.matches.findIndex(({ field }) => field === "content");

          if (matchIndex === -1) {
            result.matches = [...result.matches, { field: "content", positions: [position] }];
          } else {
            result.matches[matchIndex].positions.push(position);
          }

          results[index] = {
            ...result,
            score,
          };
        } else {
          results.push({
            file: entry,
            score,
            matches: [{ field: "content", positions: [position] }],
          });

          mapOfResults.set(entry.path, results.length - 1);
        }

        score++;
      }
    }

    return results;
  }
}
