// import fetch from 'node-fetch';
fetch = require('node-fetch-commonjs');

async function gettodaycolor() {
  var response = await fetch("https://particulier.edf.fr/services/rest/referentiel/searchTempoStore?dateRelevant=" + getday());
  const body = await response.text();
  const data = JSON.parse(body);
  return data
}


function getday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  
  const formattedToday = yyyy + "-" + mm + "-" + dd
  return formattedToday;
}

module.exports = {gettodaycolor}