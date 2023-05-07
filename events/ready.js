const { Events } = require('discord.js');
const cron = require('node-cron');
const { google } = require('googleapis');
const https = require('https');


//? Auth object for google API
const auth = new google.auth.GoogleAuth({
  keyFile: './G_credentials.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

//? Weather TOKEN
let WEATHER_TOKEN;
if (process.env.WEATHER_TOKEN) {
	WEATHER_TOKEN = process.env.WEATHER_TOKEN;
} else {
  	const config = require('../config.json');
  	WEATHER_TOKEN = config.WEATHER_TOKEN;
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute: async (client) => {
    //! Login message
    console.log(`Ready! Logged in as ${client.user.tag}`);


    //! ------------------------------
    //! Send status
    //! ------------------------------
    //? Get channel
    const channelStatus = client.channels.cache.get('1100040777213681714');

    //? Send the first message with updated status
    const lastRow = await getData();
    channelStatus.send(`__UPDATED STATUS__: \n\n-> Current status of : **${lastRow[1]}** --> __***${lastRow[2]}***__\n\n> \`${lastRow[3]}\` \n> Last update : \`${lastRow[0]}\``);

    //? Schedule task to run every 10 minutes
    cron.schedule('*/5 * * * *', async () => {
      // console.log("Updating status...")
      const lastRow = await getData();
      sendUpdatedStatus(channelStatus, lastRow);
    });

    //! ------------------------------
    //! Send info of Raining in Troo each minutes
    //! ------------------------------
    cron.schedule('*/30 * * * *', () => {
      const city = 'Troo';
      const lat = 47.777709;
      const lon = 0.796037;
      const apiKey = WEATHER_TOKEN;
      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=metric&appid=${apiKey}&cnt=48`; // 48 hours forecast
      
      const channel = client.channels.cache.get('1101154133714669671');
      channel.send("Updating weather...");
      
      https.get(url, (response) => {
        let data = '';
      
        response.on('data', (chunk) => {
          data += chunk;
        });
      
        response.on('end', () => {
          try {
            const weatherData = JSON.parse(data);
      
            if (weatherData.hourly) {
              const next48Hours = weatherData.hourly.slice(0, 48);
              const willRain = next48Hours.some(hour => hour.weather[0].main === 'Rain');
      
              if (willRain) {
                const newMessage = `☔️ It will rain in ${city} in the next 48 hours.\n\n> ${next48Hours.map(hour => `**${new Date(hour.dt * 1000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}** - ${hour.weather[0].description}`).join('\n')}`;
                // console.log(newMessage)

                //? Send a message to the channel to notify the user <@176945428955267073> and then delete it after 5 seconds
                channel.messages.fetch({ limit: 1 }).then(messages => {
                  const lastMessage = messages.first();
                  if (!lastMessage.content.toLowerCase().includes('rain')) {
                    channel.send(`<@176945428955267073> It will rain in ${city} in the next 48 hours.`).then(msg => {
                      msg.delete({ timeout: 5000 })
                    })
                  }
                });
      
                //? Update the last message in the channel with the new forecast information
                channel.messages.fetch({ limit: 1 }).then(messages => {
                  const lastMessage = messages.first();
                  lastMessage.edit(newMessage);
                });

              
              } else {
                const newMessage = '☀️ It will not rain in the next 48 hours.';
                console.log(newMessage)
      
                //? Update the last message in the channel with the new forecast information
                channel.messages.fetch({ limit: 1 }).then(messages => {
                  const lastMessage = messages.first();
                  lastMessage.edit(newMessage);
                });
              }
            } else {
              channel.send('Failed to fetch weather data. Please try again later.');
            }
          } catch (error) {
            console.error(error);
            channel.send('Failed to fetch weather data. Please try again later.');
          }
        });
      }).on('error', (error) => {
        console.error(error);
        channel.send('Failed to fetch weather data. Please try again later.');
      });
    });
    
  },
};

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

const sendUpdatedStatus = (channel, lastRow) => {
  //? Update the last message in the channel with the new status
  channel.messages.fetch({ limit: 1 }).then(messages => {
    const lastMessage = messages.first();
    lastMessage.edit(`__UPDATED STATUS__: \n\n-> Current status of : **${lastRow[1]}** --> __***${lastRow[2]}***__\n\n> \`${lastRow[3]}\` \n> Last update : \`${lastRow[0]}\``);
  });
};

