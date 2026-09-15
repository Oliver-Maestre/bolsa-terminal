/** Shared SWR refresh interval for screens the user can be actively looking
 * at (Dashboard, Screener, Chart, Comparison, Portfolio, Broker). SWR's
 * default `refreshWhenHidden: false` already pauses this while the browser
 * tab isn't visible, and unmounting a page cancels its hooks — so this alone
 * gives "refresh every minute while the screen is active, otherwise not".
 *
 * Bot/AI pages use SSE streaming instead and don't use this constant.
 */
export const REFRESH_INTERVAL_MS = 60_000;
