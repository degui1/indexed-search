import { readdir, readFile, stat } from "fs/promises";
import { join, basename, extname } from "path";
import type { FileEntry, Config } from "./types.js";

async function walk(
  dir: string,
  recursive: boolean,
  extensions: string[],
  maxSize: number
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  const items = await readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);

    if (item.isDirectory() && recursive) {
      entries.push(...(await walk(fullPath, recursive, extensions, maxSize)));
      continue;
    }

    if (!item.isFile()) continue;

    const ext = extname(item.name).replace(".", "").toLowerCase();
    if (!extensions.includes(ext)) continue;

    const info = await stat(fullPath);
    if (info.size > maxSize) continue;

    try {
      const content = await readFile(fullPath, "utf-8");
      entries.push({ path: fullPath, name: basename(item.name), content, size: info.size });
    } catch {
      // skip unreadable or binary files
    }
  }

  return entries;
}

export async function crawl(rootPath: string, config: Config): Promise<FileEntry[]> {
  return walk(rootPath, config.recursive, config.extensions, config.maxFileSizeBytes);
}
