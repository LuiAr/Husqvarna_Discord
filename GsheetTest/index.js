
const fs = require('fs');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'G_credentials.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const getData = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const spreadsheetId = '1u0xYx6zCnpoIqI3lQxzSenlQK0YtFik6IVZ_s4oLULk';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `Feuille 1!A:D` // Replace with the name of your sheet or the range of cells you want to get
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const csvData = rows.map(row => row.join(',')).join('\n');
  fs.writeFile('data.csv', csvData, err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Data saved to data.csv file!');
  });
};

// getData();

// async function readCSV(filePath) {
//     const response = await fetch(filePath);
//     const data = await response.text();
    
//     const rows = data.trim().split('\n');
//     const headers = ['date','timestamp', 'name', 'status', 'description'];
    
//     return rows.map(row => {
//       const values = row.split(',');
//       const obj = {};
//       headers.forEach((header, i) => obj[header] = values[i]);
//       return obj;
//     });
// }:
  
// const data = await readCSV('data.csv');
// console.log(data);
  

const csv = require('csvtojson');
const csvFilePath = 'data.csv';
const jsonFilePath = 'data.json';
const csvData = [];

csv()
.fromFile(csvFilePath)
.on('json', (jsonObj) => {
    csvData.push(jsonObj);
})
.on('done', (error) => {
    if (error) {
        console.error(error);
    } else {
        fs.writeFile(jsonFilePath, JSON.stringify(csvData), (error) => {
            if (error) {
                console.error(error);
            } else {
                console.log(`Data saved to ${jsonFilePath}`);
            }
        });
    }
});

