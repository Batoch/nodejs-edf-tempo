const fetch = require('node-fetch-commonjs');

function getday(daysToAdd = 0, yearsToAdd = 0) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + yearsToAdd);
  date.setDate(date.getDate() + daysToAdd);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

async function getdaycolor(day = getday()) {
  let retrycount = 0;
  while (retrycount < 10) {
    try {
      const url = `https://api-commerce.edf.fr/commerce/activet/v1/calendrier-jours-effacement?option=TEMPO&dateApplicationBorneInf=${getday(-1)}&dateApplicationBorneSup=${getday()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.errors?.[0]) {
        throw new Error(data.errors[0].description);
      }

      const daycolor = data.content.options[0].calendrier.find(element => element.dateApplication === day)?.statut;
      return daycolor || "TEMPO_UNKNOW";
    } catch (error) {
      console.error('Error:', error.message);
      retrycount++;
      await new Promise(resolve => setTimeout(resolve, 10000)); // wait 10s
    }
  }
  return "TEMPO_UNKNOW";
}

module.exports = { getdaycolor, getday };
