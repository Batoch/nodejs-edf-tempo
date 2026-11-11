const API_URL = 'https://api-commerce.edf.fr/commerce/activet/v1/calendrier-jours-effacement';
const UNKNOWN = 'TEMPO_UNKNOWN';

// Tempo days follow the French calendar, whatever the host timezone is.
const parisDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(isoDate, daysToAdd = 0, yearsToAdd = 0) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + yearsToAdd);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return formatDate(date);
}

function getday(daysToAdd = 0, yearsToAdd = 0) {
  return shiftDate(parisDateFormatter.format(new Date()), daysToAdd, yearsToAdd);
}

/**
 * Returns the Tempo color of `day` ('TEMPO_BLEU', 'TEMPO_BLANC', 'TEMPO_ROUGE'),
 * or 'TEMPO_UNKNOWN' if the API does not know this day yet.
 * Throws if the API could not be reached after `retries` attempts.
 * `onError(error, attempt)` is called on each failed attempt (e.g. for logging).
 */
async function getdaycolor(day = getday(), { retries = 10, retryDelay = 10000, timeout = 10000, onError } = {}) {
  const params = new URLSearchParams({
    option: 'TEMPO',
    dateApplicationBorneInf: shiftDate(day, -1),
    dateApplicationBorneSup: day,
  });
  const url = `${API_URL}?${params}`;

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
      const data = await response.json().catch(() => null);

      if (data?.errors?.[0]) {
        throw new Error(data.errors[0].description);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const calendrier = data?.content?.options?.[0]?.calendrier;
      if (!Array.isArray(calendrier)) {
        throw new Error('Unexpected API response format');
      }

      return calendrier.find(element => element.dateApplication === day)?.statut || UNKNOWN;
    } catch (error) {
      lastError = error;
      onError?.(error, attempt);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  throw new Error(`EDF Tempo API failed after ${retries} attempt(s): ${lastError?.message}`, { cause: lastError });
}

module.exports = { getdaycolor, getday, UNKNOWN };
