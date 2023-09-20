const { discoverGateway } = require('node-tradfri-client');

const discoveredGateways = await discoverGateway();
const { identity, psk } = discoveredGateways[0];
console.log(`Identity: ${identity}`);
console.log(`PSK: ${psk}`);