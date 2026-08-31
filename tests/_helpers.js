/**
 * Shared test environment probes.
 *
 * Live suites (e2e against TradingView Desktop, server-side Pine compiles)
 * skip cleanly when their backend is unavailable instead of failing the run,
 * so `npm test` is green on CI and offline machines while still exercising
 * everything when TradingView is reachable.
 */
import CDP from 'chrome-remote-interface';

const PINE_FACADE_URL =
  'https://pine-facade.tradingview.com/pine-facade/translate_light?user_name=Guest&pine_id=00000000-0000-0000-0000-000000000000';

/** True when TradingView Desktop is running with CDP and has a chart tab. */
export async function tvDesktopAvailable(port = 9222) {
  try {
    const targets = await CDP.List({ host: 'localhost', port });
    return targets.some(t => t.url && /tradingview\.com\/chart/i.test(t.url));
  } catch {
    return false;
  }
}

/** True when the guest Pine compile endpoint answers a trivial compile. */
export async function pineApiAvailable() {
  try {
    const body = new URLSearchParams();
    body.append('source', '//@version=6\nindicator("probe")\nplot(close)');
    const res = await fetch(PINE_FACADE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://www.tradingview.com/',
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
