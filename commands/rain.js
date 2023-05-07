const { SlashCommandBuilder } = require('discord.js');
const https = require('https');

//TODO TOKENS TOKENS TOKENS TOKENS
//? ------------------------------
//? Weather TOKEN
let WEATHER_TOKEN;

if (process.env.DISCORD_TOKEN) {
    WEATHER_TOKEN = process.env.WEATHER_TOKEN;
} else {
    const config = require('../config.json');
    WEATHER_TOKEN = config.WEATHER_TOKEN;
}
//? ------------------------------
//TODO TOKENS TOKENS TOKENS TOKENS


module.exports = {
    data: new SlashCommandBuilder()
      .setName('rain')
      .setDescription('Check if it will rain in the next 24 hours at a given location')
      .addNumberOption(option =>
        option.setName('lat')
          .setDescription('Latitude of the location')
          .setRequired(true)
      )
      .addNumberOption(option =>
        option.setName('lon')
          .setDescription('Longitude of the location')
          .setRequired(true)
      ),
    async execute(interaction) {
      const lat = interaction.options.getNumber('lat');
      const lon = interaction.options.getNumber('lon');
      const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=metric&appid=${WEATHER_TOKEN}`;
  
      https.get(url, (response) => {
        let data = '';
  
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        response.on('end', () => {
          try {
            const weatherData = JSON.parse(data);
  
            if (weatherData.hourly) {
              const next24Hours = weatherData.hourly.slice(0, 24);
              const willRain = next24Hours.some(hour => hour.weather[0].main === 'Rain');
  
              if (willRain) {
                const cityUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_TOKEN}`;
                https.get(cityUrl, (cityResponse) => {
                  let cityData = '';
  
                  cityResponse.on('data', (cityChunk) => {
                    cityData += cityChunk;
                  });
  
                  cityResponse.on('end', () => {
                    try {
                      const cityWeatherData = JSON.parse(cityData);
                      const cityName = cityWeatherData.name;
                      interaction.reply(`It will rain in ${cityName} in the next 24 hours.`);
                    } catch (error) {
                      console.error(error);
                      interaction.reply('Failed to fetch weather data. Please try again later.');
                    }
                  });
                });
              } else {
                interaction.reply('It will not rain in the next 24 hours.');
              }
            } else {
              interaction.reply('Failed to fetch weather data. Please try again later.');
            }
          } catch (error) {
            console.error(error);
            interaction.reply('Failed to fetch weather data. Please try again later.');
          }
        });
      }).on('error', (error) => {
        console.error(error);
        interaction.reply('Failed to fetch weather data. Please try again later.');
      });
    },
  };


// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('rain')
//         .setDescription('Know if it is raining in a city')
//         .addStringOption(option =>
//             option.setName('city')
//             .setDescription('City name')
//             .setRequired(true)
//         ),
//     async execute(interaction) {
//         const city = interaction.options.getString('city');
//         const apiKey = WEATHER_TOKEN;
//         const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

//         https.get(url, (response) => {
//             let data = '';

//             response.on('data', (chunk) => {
//                 data += chunk;
//             });

//             response.on('end', () => {
//                 try {
//                     const weatherData = JSON.parse(data);

//                     if (weatherData.cod === 200) {
//                         if (weatherData.weather && weatherData.weather[0].main === 'Rain') {
//                             interaction.reply(`It's raining in ${city} right now!`);
//                         } else {
//                             interaction.reply(`It's not raining in \`${city}\` right now.`);
//                         }
//                     } else {
//                         interaction.reply(`Failed to fetch weather data. Please try again later.`);
//                     }
//                 } catch (error) {
//                     console.error(error);
//                     interaction.reply('Failed to fetch weather data. Please try again later.');
//                 }
//             });
//         }).on('error', (error) => {
//             console.error(error);
//             interaction.reply('Failed to find the city, train another name.');
//         });
//     },
// };
