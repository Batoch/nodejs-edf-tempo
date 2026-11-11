# nodejs-edf-tempo

Récupère la couleur d'un jour Tempo (EDF). Nécessite Node.js 18 ou plus (`fetch` natif), sans dépendance.

```js
const { getdaycolor, getday, UNKNOWN } = require('edf-tempo');

await getdaycolor();          // aujourd'hui → 'TEMPO_BLEU' | 'TEMPO_BLANC' | 'TEMPO_ROUGE' | 'TEMPO_UNKNOWN'
await getdaycolor(getday(1)); // demain ('TEMPO_UNKNOWN' tant qu'EDF ne l'a pas publié)

try {
  await getdaycolor(getday(), {
    retries: 3,          // nombre de tentatives (défaut 10)
    retryDelay: 5000,    // attente entre tentatives en ms (défaut 10000)
    timeout: 10000,      // délai max par requête en ms (défaut 10000)
    onError: (err, attempt) => console.warn(`Tentative ${attempt} :`, err.message),
  });
} catch (err) {
  // l'API n'a pas répondu après toutes les tentatives (err.cause = dernière erreur)
}
```

`getday(daysToAdd, yearsToAdd)` renvoie une date `YYYY-MM-DD` selon le fuseau Europe/Paris.

## Changements en 2.0.0 (incompatibles)

- `TEMPO_UNKNOW` devient `TEMPO_UNKNOWN` (constante exportée : `UNKNOWN`).
- En cas d'échec de l'API, `getdaycolor` lève une erreur au lieu de renvoyer la valeur inconnue. `TEMPO_UNKNOWN` signifie seulement que le jour n'est pas (encore) dans le calendrier.
- Plus d'écriture dans la console : utiliser l'option `onError` pour journaliser.

## Tests

```bash
npm test
```
