// import fetch from 'node-fetch';
fetch = require('node-fetch-commonjs');

async function getdaycolor(day = getday()) {
  var retrycount = 0;
  while (retrycount < 10) {
    try {
      var response = await fetch("https://api-commerce.edf.fr/commerce/activet/v1/calendrier-jours-effacement?option=TEMPO&dateApplicationBorneInf=" + getday(1, -1) + "&dateApplicationBorneSup=" + getday(1));
      const data = JSON.parse(await response.text());

      if (data.errors[0]) {
        throw new Error(data.errors[0].description)
      }
      // Find the color of the day from data 
      const daycolor = data.content.options[0].calendrier.find(element => element.dateApplication === day).statut
      
      return daycolor
    }
    catch (error) {
      console.error('Error:', error);
      retrycount++;
      // wait 10s
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  return "TEMPO_UNKNOW"
}


function getday(daytoadd = 0, yeartoadd = 0) {
  const today = new Date();
  const yyyy = today.getFullYear() + yeartoadd;
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate() + daytoadd;
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  
  const formattedToday = yyyy + "-" + mm + "-" + dd
  return formattedToday;
}

module.exports = {getdaycolor, getday}