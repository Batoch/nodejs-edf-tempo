const { test, afterEach } = require('node:test');
const assert = require('node:assert');
const { getdaycolor, getday, UNKNOWN } = require('..');

const realFetch = global.fetch;
afterEach(() => { global.fetch = realFetch; });

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
const calendar = (entries) => jsonResponse({ content: { options: [{ calendrier: entries }] } });
const fast = { retryDelay: 1 };

test('getday returns YYYY-MM-DD and shifts days/years', () => {
  assert.match(getday(), /^\d{4}-\d{2}-\d{2}$/);
  const today = new Date(`${getday()}T00:00:00Z`);
  assert.strictEqual(new Date(`${getday(1)}T00:00:00Z`) - today, 86400000);
  assert.strictEqual(new Date(`${getday(-1)}T00:00:00Z`) - today, -86400000);
  assert.strictEqual(Number(getday(0, 1).slice(0, 4)), today.getUTCFullYear() + 1);
});

test('returns the color of the requested day and queries around it', async () => {
  const urls = [];
  global.fetch = async (url) => {
    urls.push(url);
    return calendar([{ dateApplication: '2026-03-01', statut: 'TEMPO_ROUGE' }]);
  };
  assert.strictEqual(await getdaycolor('2026-03-01'), 'TEMPO_ROUGE');
  const params = new URL(urls[0]).searchParams;
  assert.strictEqual(params.get('dateApplicationBorneInf'), '2026-02-28');
  assert.strictEqual(params.get('dateApplicationBorneSup'), '2026-03-01');
});

test('returns UNKNOWN when the day is not in the calendar yet', async () => {
  global.fetch = async () => calendar([]);
  assert.strictEqual(await getdaycolor('2026-03-02'), UNKNOWN);
  assert.strictEqual(UNKNOWN, 'TEMPO_UNKNOWN');
});

test('retries transient failures, then succeeds', async () => {
  let calls = 0;
  const errors = [];
  global.fetch = async () => {
    calls++;
    if (calls < 3) throw new Error('network down');
    return calendar([{ dateApplication: '2026-03-01', statut: 'TEMPO_BLEU' }]);
  };
  const color = await getdaycolor('2026-03-01', { ...fast, retries: 5, onError: (e, n) => errors.push([e.message, n]) });
  assert.strictEqual(color, 'TEMPO_BLEU');
  assert.deepStrictEqual(errors, [['network down', 1], ['network down', 2]]);
});

test('throws after exhausting retries, with the last error as cause', async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return { ok: false, status: 500, json: async () => { throw new SyntaxError('not json'); } }; };
  await assert.rejects(getdaycolor('2026-03-01', { ...fast, retries: 3 }), (err) => {
    assert.match(err.message, /after 3 attempt/);
    assert.strictEqual(err.cause.message, 'HTTP 500');
    return true;
  });
  assert.strictEqual(calls, 3);
});

test('surfaces API error descriptions', async () => {
  global.fetch = async () => jsonResponse({ errors: [{ description: 'bad date' }] }, 400);
  await assert.rejects(getdaycolor('2026-03-01', { retries: 1 }), (err) => err.cause.message === 'bad date');
});

test('rejects unexpected response shapes', async () => {
  global.fetch = async () => jsonResponse({ content: {} });
  await assert.rejects(getdaycolor('2026-03-01', { retries: 1 }), (err) => /Unexpected API response/.test(err.cause.message));
});
