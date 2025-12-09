const qrcode = require('qrcode-terminal');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n==================================================');
console.log('       Expo Cloudflare QR Code Generator');
console.log('==================================================\n');
console.log('1. Run start_expo_tunnel.ps1 (Recommended)');
console.log('   OR');
console.log('   Run start_expo_cloudflare.bat manually');
console.log('2. Copy the URL (e.g., https://xyz.trycloudflare.com)');
console.log('3. Paste it below:\n');

const args = process.argv.slice(2);
const inputUrl = args[0];

if (inputUrl) {
    generateQr(inputUrl);
} else {
    rl.question('Paste Cloudflare URL here: ', (url) => {
        generateQr(url);
    });
}

function generateQr(url) {
    if (url) {
        // Convert https:// to exp:// to force opening in Expo Go
        const expoUrl = url.replace('https://', 'exp://').replace('http://', 'exp://');

        console.log('\nScan this QR code with Expo Go:\n');
        qrcode.generate(expoUrl, { small: true });
        console.log('\nExpo URL:', expoUrl);
    } else {
        console.log('No URL provided.');
    }
    if (!inputUrl) {
        rl.close();
        console.log('\nPress any key to exit...');
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
    } else {
        process.exit(0);
    }
}
// Remove the original rl.question block wrapper
/*
rl.question('Paste Cloudflare URL here: ', (url) => {

});
*/
