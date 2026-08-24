const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');

// Detect host LAN IP
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

console.log('\n======================================================');
console.log('       SMRITI AI: MULTI-NETWORK TUNNEL SETUP          ');
console.log('======================================================\n');

// 1. Clean up lingering zombie tunnel/ngrok processes on Windows
if (process.platform === 'win32') {
  try {
    execSync('taskkill /F /IM ngrok.exe 2>nul', { stdio: 'ignore' });
  } catch (_) {}
}

// 2. Verify backend is running on port 3000
const checkBackend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
};

(async () => {
  const isBackendLive = await checkBackend();
  if (!isBackendLive) {
    console.log('⚠️  Notice: Backend on port 3000 does not appear active yet.');
    console.log('👉 Make sure you run "npm run dev" in Smriti-AI-Backend in another terminal.\n');
  } else {
    console.log('✅ Backend API detected on port 3000.\n');
  }

  console.log('1. Starting High-Speed Backend API Tunnel on port 3000...');

  const lt = spawn('npx', ['--yes', 'localtunnel', '--port', '3000'], {
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let expoProcess = null;
  let tunnelUrlFound = false;
  let keepAliveInterval = null;

  const startKeepAlive = (tunnelUrl) => {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    // Ping every 25 seconds to keep tunnel alive and prevent 503 idle drops
    keepAliveInterval = setInterval(() => {
      try {
        const parsed = new URL(tunnelUrl);
        const options = {
          hostname: parsed.hostname,
          path: '/',
          headers: {
            'Bypass-Tunnel-Reminder': 'true',
            'User-Agent': 'Smriti-AI-KeepAlive',
          },
          timeout: 5000,
        };
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.get(options, () => {});
        req.on('error', () => {});
        req.setTimeout(5000, () => req.destroy());
      } catch (_) {}
    }, 25000);
  };

  const startExpo = (backendUrl) => {
    if (tunnelUrlFound) return;
    tunnelUrlFound = true;

    console.log(`\n Backend Tunnel Active: ${backendUrl}`);
    startKeepAlive(backendUrl);

    console.log('2. Launching Expo Metro in Tunnel Mode with public API URL...\n');

    // Update .env dynamically
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
        console.log(' 💡 Expo Tunnel Note:');
        console.log('If you saw "remote gone away" or "failed to start tunnel":');
        console.log('');
        console.log('⚡ Permanent Fix 1 (Recommended - 100% Reliable, 0 Drops):');
        console.log(`   Connect laptop & phone to same Wi-Fi / Hotspot and run:`);
        console.log('   👉 npm run lan');
        console.log(`   (Connects directly via http://${localIp}:3000 with 0 latency)`);
        console.log('');
        console.log('🔑 Fix 2 (If you need cellular data tunneling without Wi-Fi):');
        console.log('   1. Get free token: https://dashboard.ngrok.com/get-started/your-authtoken');
        console.log('   2. Run: npx ngrok config add-authtoken <YOUR_TOKEN>');
        console.log('   3. Run: npm run tunnel');
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
    if (!errStr.includes('ExperimentalWarning')) {
      console.error(`[Tunnel Warning] ${errStr.trim()}`);
    }
  });

  // Fallback in case localtunnel output is delayed: wait 6s and check or start expo
  setTimeout(() => {
    if (!tunnelUrlFound) {
      console.log('\nStarting Expo tunnel with LAN fallback...');
      startExpo(`http://${localIp}:3000`);
    }
  }, 6000);

  const cleanup = () => {
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    if (lt && !lt.killed) {
      try {
        if (process.platform === 'win32' && lt.pid) {
          execSync(`taskkill /pid ${lt.pid} /T /F 2>nul`);
        } else {
          lt.kill();
        }
      } catch (_) {}
    }
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
})();
