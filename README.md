# nodejs-edf-tempo

Fetches the EDF Tempo color of a given day. Requires Node.js 18 or later (native `fetch`), no dependencies.

```js
const { getdaycolor, getday, UNKNOWN } = require('edf-tempo');

await getdaycolor();          // today → 'TEMPO_BLEU' | 'TEMPO_BLANC' | 'TEMPO_ROUGE' | 'TEMPO_UNKNOWN'
await getdaycolor(getday(1)); // tomorrow ('TEMPO_UNKNOWN' until EDF publishes it)

try {
  await getdaycolor(getday(), {
    retries: 3,          // number of attempts (default 10)
    retryDelay: 5000,    // wait between attempts in ms (default 10000)
    timeout: 10000,      // max duration per request in ms (default 10000)
    onError: (err, attempt) => console.warn(`Attempt ${attempt}:`, err.message),
  });
} catch (err) {
  // the API failed after all attempts (err.cause = last error)
}
```

`getday(daysToAdd, yearsToAdd)` returns a `YYYY-MM-DD` date in the Europe/Paris timezone.

## Breaking changes in 2.0.0

- `TEMPO_UNKNOW` is renamed to `TEMPO_UNKNOWN` (exported as `UNKNOWN`).
- When the API fails, `getdaycolor` throws instead of returning the unknown value. `TEMPO_UNKNOWN` now only means the day is not (yet) in the calendar.
- No more console output: use the `onError` option for logging.

## Tests

```bash
npm test
```
