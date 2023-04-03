const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    const sent = await interaction.reply('Pinging...');
    const ping = sent.createdTimestamp - interaction.createdTimestamp;

    // await sent.edit(`Pong! \`${ping}ms\``);
    await sent.edit(`🏓 | Latency is: **${Date.now() - interaction.createdTimestamp}ms.**`);
  },
};
