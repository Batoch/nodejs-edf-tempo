// import fetch from 'node-fetch';
fetch = require('node-fetch-commonjs');

async function getdaycolor(day = getday()) {
  try {
    var response = await fetch("https://api-commerce.edf.fr/commerce/activet/v1/calendrier-jours-effacement?option=TEMPO&dateApplicationBorneInf=" + getday(1, -1) + "&dateApplicationBorneSup=" + getday(1));
    
    const body = await response.text();
    const data = JSON.parse(body);

    // Find the color of the day from data 
    return data.content.options[0].calendrier.find(element => element.dateApplication === day).statut
  }
  catch (error) {
    console.error('Error:', error);
  }
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