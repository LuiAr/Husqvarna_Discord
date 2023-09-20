const { Events } = require('discord.js');
const cron = require('node-cron');
const https = require('https');

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
    //! Send info of Raining in Troo each minutes
    //! ------------------------------
    const channel = client.channels.cache.get('1101154133714669671');

    //? remove all messages from channel
    channel.bulkDelete(100);

    //? send new message
    channel.send("Updating weather...");
    cron.schedule('*/30 * * * *', () => {
      const city = 'Troo';
      const lat = 47.777709;
      const lon = 0.796037;
      const apiKey = WEATHER_TOKEN;
      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=metric&appid=${apiKey}&cnt=48`; // 48 hours forecast
      
      const channel = client.channels.cache.get('1101154133714669671');
      
      https.get(url, (response) => {
        let data = '';
      
        response.on('data', (chunk) => {
          data += chunk;
        });
      
        response.on('end', () => {
          try {
            const weatherData = JSON.parse(data);
      
            if (weatherData.hourly) {
              const next48Hours = weatherData.hourly.slice(0, 24); //* CHANGED TO 24 HOURS
              const willRain = next48Hours.some(hour => hour.weather[0].main === 'Rain');
      
              if (willRain) {
                const newMessage = `☔️ <@176945428955267073> It will rain in ${city} in the next 24 hours.\n\n> ${next48Hours.map(hour => `**${new Date(hour.dt * 1000).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}** - ${hour.weather[0].description}`).join('\n')}`;
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

