const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setPresence({
            activity: { name: 'Husqvarna', type: 'PLAYING' },
            status: 'online',
            afk: false,
            description: 'Probably mowing outside ...'
        });
    },
};
