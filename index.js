// For commands handling
const fs = require('node:fs');
const path = require('node:path');

// For event happing at a specific time
const { cron } = require('node-cron');


//TODO TOKENS TOKENS TOKENS TOKENS
//? ------------------------------
//? Discord TOKEN
let DISCORD_TOKEN;

if (process.env.DISCORD_TOKEN) {
	DISCORD_TOKEN = process.env.DISCORD_TOKEN;
} else {
  	const config = require('./config.json');
  	DISCORD_TOKEN = config.DISCORD_TOKEN;
}
//? ------------------------------
//TODO TOKENS TOKENS TOKENS TOKENS


const { Client, Collection, GatewayIntentBits , Events , 
        EmbedBuilder , PermissionsBitField , Permissions, 
        MessageEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle ,
        ModalBuilder,TextInputBuilder, TextInputStyle , AttachmentBuilder  } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const prefix = '!';



// For events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


// For commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on("messageCreate" , (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLocaleLowerCase();

    // message array

    const messageArray = message.content.split(" ");
    const argument = messageArray.slice(1);
    const cmd = messageArray[0];
    
})


//TODO -------------
//TODO ---- EVENTS
// Using cron to schedule events, create an event that occurs at a specific time (e.g. 12:00 PM every day)


//TODO -------------
//TODO -------------





client.login(DISCORD_TOKEN);