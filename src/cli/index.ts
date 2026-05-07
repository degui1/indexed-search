import { createInterface } from "readline";
import { resolve } from "path";
import { Command } from "commander";
import chalk from "chalk";
import { loadConfig } from "../config.js";
import { crawl } from "../core/crawler.js";
import { measureBuild, measureSearch } from "../core/runner.js";
import {
  spinner,
  printBanner,
  printConfig,
  printBuildMetrics,
  printResults,
  printError,
} from "./ui.js";
import type { SearchEngine, Config } from "../core/types.js";

async function loadEngine(algorithm: Config["algorithm"]): Promise<SearchEngine> {
  switch (algorithm) {
    case "linear": {
      const { LinearSearch } = await import("../algorithms/linear.js");
      return new LinearSearch();
    }
    case "inverted-index": {
      const { InvertedIndex } = await import("../algorithms/inverted-index.js");
      return new InvertedIndex();
    }
    case "trie": {
      const { TrieSearch } = await import("../algorithms/trie.js");
      return new TrieSearch();
    }
    case "tfidf": {
      const { TfIdfSearch } = await import("../algorithms/tfidf.js");
      return new TfIdfSearch();
    }
  }
}

async function main() {
  const program = new Command();

  program
    .name("indexed-search")
    .argument("<path>", "path to index")
    .option(
      "--algorithm <name>",
      "override config algorithm (linear | inverted-index | trie | tfidf)"
    )
    .option("--no-recursive", "disable recursive directory crawl")
    .parse();

  const [inputPath] = program.args;
  const opts = program.opts();
  const config = loadConfig();

  if (opts.algorithm) config.algorithm = opts.algorithm;
  if (opts.recursive === false) config.recursive = false;

  printBanner();
  printConfig(config.algorithm, config.recursive, config.extensions);

  const rootPath = resolve(inputPath);

  spinner.start("Crawling files...");
  let entries;
  try {
    entries = await crawl(rootPath, config);
  } catch {
    spinner.fail();
    printError(`Cannot read path: ${rootPath}`);
    process.exit(1);
  }

  spinner.text = `Building index (${entries.length} files)...`;

  let engine: SearchEngine;
  try {
    engine = await loadEngine(config.algorithm);
    const buildMetrics = measureBuild(engine, entries);
    spinner.succeed("Index ready");
    printBuildMetrics(buildMetrics);
  } catch (err) {
    spinner.fail();
    printError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  rl.on("SIGINT", () => {
    console.log(chalk.gray("\nBye!"));
    process.exit(0);
  });

  const prompt = () => {
    rl.question(chalk.bold.cyan("search> "), (raw) => {
      const term = raw.trim();

      if (!term) {
        prompt();
        return;
      }

      if (term === "exit" || term === "quit") {
        console.log(chalk.gray("Bye!"));
        rl.close();
        return;
      }

      try {
        const { results, searchTimeMs } = measureSearch(engine, term);
        printResults(results, searchTimeMs, term);
      } catch (err) {
        printError(err instanceof Error ? err.message : String(err));
      }

      prompt();
    });
  };

  prompt();
}

main();
