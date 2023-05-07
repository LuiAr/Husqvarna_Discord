const fs = require('fs');
const { google } = require('googleapis');
const { SlashCommandBuilder } = require('discord.js');

// Auth object for google API
const auth = new google.auth.GoogleAuth({
  keyFile: './G_credentials.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Get current status of your robot.'),
  async execute(interaction) {
    try {
      const lastRow = await getData();
      if (lastRow.length > 0) {
        await interaction.reply(`-> Current status of : **${lastRow[1]}** --> __***${lastRow[2]}***__\n\n> \`${lastRow[3]}\` \n> Last update : \`${lastRow[0]}\``);
      } else {
        await interaction.reply(`> No data found!`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`> An error occurred!`);
    }
  },
};

//? Exemple of output
//? [
//?     'April 6, 2023 at 04:04AM',
//?     'Willy',
//?     'DISCONNECTED',
//?     'Willy has lost its connection. Either this is temporary and your mower will reconnect automatically or your mower has been switched off.'
//?  ]


const getData = async () => {
  // Authenticate, get client and sheets
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Sheet ID
  const spreadsheetId = '1u0xYx6zCnpoIqI3lQxzSenlQK0YtFik6IVZ_s4oLULk';

  // Get data from the sheet
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Feuille 1!A:D` // Replace with the name of your sheet or the range of cells you want to get
    });

    // Get the last row
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Return the last row
    return rows[rows.length - 1];
  } catch (err) {
    console.log(`The API returned an error: ${err}`);
  }
};