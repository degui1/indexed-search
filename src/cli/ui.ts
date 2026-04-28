import chalk from 'chalk'
import ora from 'ora'
import type { SearchResult } from '../core/types.js'

export const spinner = ora({ color: 'cyan' })

export function printBanner() {
  console.log(chalk.bold.cyan('\n[ indexed-search ]\n'))
}

export function printConfig(algorithm: string, recursive: boolean, extensions: string[]) {
  console.log(chalk.gray('Algorithm : ') + chalk.white(algorithm))
  console.log(chalk.gray('Recursive : ') + chalk.white(String(recursive)))
  console.log(chalk.gray('Extensions: ') + chalk.white(extensions.join(', ')) + '\n')
}

export function printBuildMetrics(metrics: {
  buildTimeMs: number
  memoryDeltaBytes: number
  fileCount: number
}) {
  console.log(chalk.green(`✓ Indexed ${chalk.bold(String(metrics.fileCount))} file(s)`))
  console.log(chalk.gray('  Build  : ') + chalk.white(metrics.buildTimeMs.toFixed(2) + ' ms'))
  console.log(chalk.gray('  Memory : ') + chalk.white(formatBytes(metrics.memoryDeltaBytes)) + '\n')
}

export function printResults(results: SearchResult[], searchTimeMs: number, term: string) {
  console.log(
    chalk.gray('Search : ') +
      chalk.white(searchTimeMs.toFixed(3) + ' ms') +
      chalk.gray(' — ') +
      chalk.white(results.length + ' result(s)') +
      '\n',
  )

  if (results.length === 0) {
    console.log(chalk.yellow('  No results found.\n'))
    return
  }

  for (const r of results) {
    console.log(chalk.cyan('  ' + r.file.path))
    console.log(chalk.gray('    score: ') + chalk.white(r.score.toFixed(4)))

    for (const match of r.matches) {
      if (match.field === 'name') {
        console.log(chalk.gray('    name › ') + highlightTerm(r.file.name, term))
      } else {
        for (const pos of match.positions) {
          console.log(chalk.gray('    content › ') + extractSnippet(r.file.content, pos, term))
        }
      }
    }
  }
  console.log()
}

function extractSnippet(content: string, position: number, term: string, contextSize = 60): string {
  const start = Math.max(0, position - contextSize)
  const end = Math.min(content.length, position + term.length + contextSize)
  const raw = content.slice(start, end).replace(/\s+/g, ' ').trim()
  const prefix = start > 0 ? chalk.gray('...') : ''
  const suffix = end < content.length ? chalk.gray('...') : ''
  return prefix + highlightTerm(raw, term) + suffix
}

function highlightTerm(text: string, term: string): string {
  const idx = text.indexOf(term)
  if (idx === -1) return text
  return text.slice(0, idx) + chalk.bold.yellow(term) + text.slice(idx + term.length)
}

export function printError(msg: string) {
  console.error(chalk.red('✗ ' + msg))
}

function formatBytes(bytes: number): string {
  const abs = Math.abs(bytes)
  const sign = bytes < 0 ? '-' : '+'
  if (abs < 1024) return `${sign}${abs} B`
  if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(1)} KB`
  return `${sign}${(abs / (1024 * 1024)).toFixed(2)} MB`
}
