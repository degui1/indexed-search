import { readFileSync } from "fs";
import { resolve } from "path";
import type { Config } from "./core/types.js";

const defaults: Config = {
  algorithm: "linear",
  recursive: true,
  extensions: ["txt", "md", "js", "ts", "json"],
  maxFileSizeBytes: 1048576,
};

export function loadConfig(): Config {
  try {
    const raw = readFileSync(resolve(process.cwd(), "config.json"), "utf-8");
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}
