import type { InputType, ScrapeStrategy } from './strategies/types'

// Stubbed in Task 5; real Crawl/Platform/SinglePage mapping wired in Task 9.
export function selectStrategy(
  type: InputType,
  url: string
): ScrapeStrategy {
  void type
  void url

  throw new Error('selectStrategy is wired in Task 9')
}
