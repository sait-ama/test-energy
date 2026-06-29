import { spawn } from 'child_process';
import fs from 'fs';

const child = spawn('npx.cmd', ['-y', 'localtunnel', '--port', '3000'], { shell: true });

child.stdout.on('data', (data) => {
  const output = data.toString();
  const match = output.match(/your url is:\s*(https:\/\/[^\s]+)/i);
  if (match) {
    const url = match[1].trim();
    fs.writeFileSync('tunnel_url.txt', url);
  }
});

child.on('close', () => {
  if (fs.existsSync('tunnel_url.txt')) {
    try {
      fs.unlinkSync('tunnel_url.txt');
    } catch (e) {}
  }
});

process.on('exit', () => {
  child.kill();
  if (fs.existsSync('tunnel_url.txt')) {
    try {
      fs.unlinkSync('tunnel_url.txt');
    } catch (e) {}
  }
});
