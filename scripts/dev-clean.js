#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to safely remove directory
function removeDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✓ Removed ${dirPath}`);
    }
  } catch (error) {
    console.log(`⚠ Could not remove ${dirPath}:`, error.message);
  }
}

// Function to kill processes on specific ports
function killProcessOnPort(port) {
  try {
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}` 
      : `lsof -ti:${port}`;
    
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    
    if (process.platform === 'win32') {
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      lines.forEach(line => {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && !isNaN(pid)) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            console.log(`✓ Killed process ${pid} on port ${port}`);
          } catch (e) {
            // Process might already be dead
          }
        }
      });
    } else {
      const pids = result.trim().split('\n');
      pids.forEach(pid => {
        if (pid && !isNaN(pid)) {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
            console.log(`✓ Killed process ${pid} on port ${port}`);
          } catch (e) {
            // Process might already be dead
          }
        }
      });
    }
  } catch (error) {
    // No process found on port, which is fine
  }
}

console.log('🧹 Cleaning up development environment...');

// Kill processes on common Next.js ports
[3000, 3001, 3002, 3003, 3004, 3005].forEach(port => {
  killProcessOnPort(port);
});

// Remove cache directories
const projectRoot = path.resolve(__dirname, '..');
removeDirectory(path.join(projectRoot, '.next'));
removeDirectory(path.join(projectRoot, 'node_modules/.cache'));
removeDirectory(path.join(projectRoot, '.turbo'));

// Wait a moment for cleanup
setTimeout(() => {
  console.log('🚀 Starting clean development server...');
  
  try {
    execSync('npm run dev', { 
      stdio: 'inherit', 
      cwd: projectRoot,
      env: { ...process.env, FORCE_COLOR: '1' }
    });
  } catch (error) {
    console.error('❌ Failed to start development server:', error.message);
    process.exit(1);
  }
}, 1000);
