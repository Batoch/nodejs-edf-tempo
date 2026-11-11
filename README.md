# nodejs-edf-tempo

Récupère la couleur d'un jour Tempo (EDF). Nécessite Node.js 18 ou plus (`fetch` natif), sans dépendance.

```js
const { getdaycolor, getday } = require('edf-tempo');

await getdaycolor();          // aujourd'hui → 'TEMPO_BLEU' | 'TEMPO_BLANC' | 'TEMPO_ROUGE' | 'TEMPO_UNKNOW'
await getdaycolor(getday(1)); // demain
await getdaycolor(getday(), { retries: 3, retryDelay: 5000, timeout: 10000 });
```

`getday(daysToAdd, yearsToAdd)` renvoie une date `YYYY-MM-DD` selon le fuseau Europe/Paris.
