import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = path.join(__dirname, 'frames');
fs.mkdirSync(FRAMES_DIR, { recursive: true });

let frameIdx = 0;

const server = http.createServer((req, res) => {
  // CORS headers for localhost:3000 → localhost:9999
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/frame') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const b64 = data.png.replace(/^data:image\/png;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        const file = path.join(FRAMES_DIR, `${String(frameIdx).padStart(3, '0')}_frame.png`);
        fs.writeFileSync(file, buf);
        process.stdout.write(`\r  Frames: ${frameIdx + 1}`);
        frameIdx++;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, idx: frameIdx }));
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/stop') {
    console.log(`\nReceived stop. Total frames: ${frameIdx}`);
    res.writeHead(200);
    res.end(JSON.stringify({ total: frameIdx }));
    setTimeout(() => { server.close(); process.exit(0); }, 200);
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(9999, () => {
  console.log('Frame receiver ready on http://localhost:9999');
  console.log('  POST /frame  — save a PNG frame');
  console.log('  POST /stop   — stop server');
});
