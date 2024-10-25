const os = require('os');
require('dotenv').config();

// Get network interfaces
const networkInterfaces = os.networkInterfaces();

// Initialize variables for the first found addresses
let firstIPv4 = null;
let firstIPv6 = null;
let firstMAC = null;

// Find the first non-internal IPv4, IPv6, and MAC addresses
for (const interfaceDetails of Object.values(networkInterfaces)) {
    for (const details of interfaceDetails) {
        if (!details.internal) {
            if (!firstIPv4 && details.family === 'IPv4') {
                firstIPv4 = details.address;
            }
            if (!firstIPv6 && details.family === 'IPv6') {
                firstIPv6 = details.address;
            }
            if (!firstMAC) {
                firstMAC = details.mac;
            }
            if (firstIPv4 && firstIPv6 && firstMAC) {
                break;
            }
        }
    }
}

// Get the username
const username = os.userInfo().username;

// console.log('First IPv4 Address:', firstIPv4);
// console.log('First IPv6 Address:', firstIPv6);
// console.log('First MAC Address:', firstMAC);
// console.log('Username:', username);

exports.ip_data = {
    "ipv4_address":firstIPv4, "IPv6":firstIPv6, "MAC":firstMAC, username, 'client_name': process.env.CLIENT_NAME, 'client_type': process.env.CLIENT_TYPE
}
