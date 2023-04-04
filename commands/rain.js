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
        .setDescription('Know if it is raining in a city')
        .addStringOption(option =>
            option.setName('city')
            .setDescription('City name')
            .setRequired(true)
        ),
    async execute(interaction) {
        const city = interaction.options.getString('city');
        const apiKey = WEATHER_TOKEN;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const weatherData = JSON.parse(data);

                    if (weatherData.cod === 200) {
                        if (weatherData.weather && weatherData.weather[0].main === 'Rain') {
                            interaction.reply(`It's raining in ${city} right now!`);
                        } else {
                            interaction.reply(`It's not raining in \`${city}\` right now.`);
                        }
                    } else {
                        interaction.reply(`Failed to fetch weather data. Please try again later.`);
                    }
                } catch (error) {
                    console.error(error);
                    interaction.reply('Failed to fetch weather data. Please try again later.');
                }
            });
        }).on('error', (error) => {
            console.error(error);
            interaction.reply('Failed to find the city, train another name.');
        });
    },
};
