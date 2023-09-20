const { SlashCommandBuilder } = require('discord.js');
const { TradfriClient } = require('node-tradfri-client');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('light')
    .setDescription('Turn on/off the lights.')
    .addBooleanOption((option) =>
      option.setName('on').setDescription('Turn on the lights.')
    ),
  async execute(interaction) {
    const tradfri = new TradfriClient('your-gateway-ip');
    await tradfri.connect('your-identity', 'your-psk');

    const devices = await tradfri.getDevices();
    const light = devices.find((device) => device.name === 'your-light-name');
    const lightId = light.instanceId;

    const isOn = interaction.options.getBoolean('on');
    await tradfri.operateLight(lightId, { onOff: isOn });

    await interaction.reply(`The lights are now ${isOn ? 'on' : 'off'}.`);
  },
};