const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('  SMRITI AI: MULTI-NETWORK TUNNEL SETUP  ');
console.log('========================================\n');
console.log('1. Starting Backend API Tunnel on port 3000...');

// Start localtunnel for the backend API
const lt = spawn('npx', ['--yes', 'localtunnel', '--port', '3000'], {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe'],
});

let expoProcess = null;
let tunnelUrlFound = false;

const startExpo = (backendUrl) => {
  if (tunnelUrlFound) return;
  tunnelUrlFound = true;

  console.log(`\n Backend Tunnel Active: ${backendUrl}`);
  console.log('2. Launching Expo Metro in Tunnel Mode with public API URL...\n');

  // Update .env dynamically
  const envPath = path.join(__dirname, '..', '.env');
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('EXPO_PUBLIC_API_URL=')) {
      envContent = envContent.replace(/EXPO_PUBLIC_API_URL=.*/g, `EXPO_PUBLIC_API_URL=${backendUrl}`);
    } else {
      envContent += `\nEXPO_PUBLIC_API_URL=${backendUrl}\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(` Updated .env with EXPO_PUBLIC_API_URL=${backendUrl}`);
  } catch (err) {
    console.warn('Could not auto-update .env:', err.message);
  }

  // Launch Expo in tunnel mode with cache clear
  expoProcess = spawn('npx', ['expo', 'start', '--tunnel', '-c'], {
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_PUBLIC_API_URL: backendUrl,
    },
    cwd: path.join(__dirname, '..'),
  });

  expoProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log('\n-----------------------------------------------------------');
      console.log(' Expo Tunnel Note:');
      console.log('If you saw "remote gone away" or "failed to start tunnel",');
      console.log('Ngrok requires a free authtoken to allow tunneling.');
      console.log('');
      console.log('Fix 1 (30 seconds):');
      console.log('  1. Get free token: https://dashboard.ngrok.com/get-started/your-authtoken');
      console.log('  2. Run in terminal: npx ngrok config add-authtoken <YOUR_TOKEN>');
      console.log('  3. Re-run: npm run tunnel');
      console.log('');
      console.log('Fix 2 (No signup - Mobile Hotspot):');
      console.log('  Connect laptop to phone hotspot, then run: npx expo start -c');
      console.log('-----------------------------------------------------------\n');
    }
    cleanup();
  });
};

lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[Backend Tunnel] ${output.trim()}`);
  
  const match = output.match(/https:\/\/[^\s]+/);
  if (match && match[0]) {
    startExpo(match[0]);
  }
});

lt.stderr.on('data', (data) => {
  const errStr = data.toString();
  // Filter benign warnings
  if (!errStr.includes('ExperimentalWarning')) {
    console.error(`[Tunnel Warning] ${errStr.trim()}`);
  }
});

// Fallback in case localtunnel output is delayed: wait 5s and check or start expo
setTimeout(() => {
  if (!tunnelUrlFound) {
    console.log('\nStarting Expo tunnel (backend tunnel initializing in parallel)...');
    startExpo(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000');
  }
}, 6000);

const cleanup = () => {
  if (lt && !lt.killed) {
    try {
      lt.kill();
    } catch (_) {}
  }
  if (expoProcess && !expoProcess.killed) {
    try {
      expoProcess.kill();
    } catch (_) {}
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
