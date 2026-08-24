const { spawn, execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Auto-detect local Wi-Fi / Ethernet IPv4 address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
const backendUrl = `http://${localIp}:3000`;

console.log('\n======================================================');
console.log('       SMRITI AI: ULTRA-FAST LAN DIRECT RUNNER        ');
console.log('======================================================\n');
console.log(` Machine Local IP:  ${localIp}`);
console.log(` Backend Target:    ${backendUrl}`);
console.log(' Connection:        Direct LAN (Zero Tunnels / Zero Drops)');
console.log('------------------------------------------------------\n');

// Update .env with direct IP
const envPath = path.join(__dirname, '..', '.env');
try {
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (envContent.includes('EXPO_PUBLIC_API_URL=')) {
    envContent = envContent.replace(/EXPO_PUBLIC_API_URL=.*/g, `EXPO_PUBLIC_API_URL=${backendUrl}`);
  } else {
    envContent += `\nEXPO_PUBLIC_API_URL=${backendUrl}\n`;
  }
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(` Updated .env with EXPO_PUBLIC_API_URL=${backendUrl}`);
} catch (err) {
  console.warn('Could not update .env:', err.message);
}

console.log('\n Launching Expo Metro in LAN Mode...\n');

const expoProcess = spawn('npx', ['expo', 'start', '--lan', '-c'], {
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PUBLIC_API_URL: backendUrl,
  },
  cwd: path.join(__dirname, '..'),
});

const cleanup = () => {
  if (expoProcess && !expoProcess.killed) {
    try {
      if (process.platform === 'win32' && expoProcess.pid) {
        execSync(`taskkill /pid ${expoProcess.pid} /T /F 2>nul`);
      } else {
        expoProcess.kill();
      }
    } catch (_) {}
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
