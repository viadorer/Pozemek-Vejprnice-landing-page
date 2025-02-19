const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

// Povolení CORS pro lokální vývoj
app.use(cors());

// Parsování JSON požadavků
app.use(express.json({
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('Nevalidní JSON v požadavku:', e);
            res.status(400).json({ message: 'Nevalidní JSON data' });
            throw new Error('Nevalidní JSON');
        }
    }
}));

// Servírování statických souborů
app.use(express.static(__dirname));

// Proxy endpoint pro Ecomail API
app.post('/api/ecomail/:listId/subscribe', async (req, res) => {
    try {
        console.log('\n=== Přijat požadavek na Ecomail API ===');
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));

        const apiUrl = `https://api2.ecomailapp.cz/lists/${req.params.listId}/subscribe`;
        console.log('\nVolám API URL:', apiUrl);

        const requestBody = JSON.stringify(req.body);
        console.log('\nOdesílám data:', requestBody);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'key': req.headers.key
            },
            body: requestBody
        });

        console.log('API Response status:', response.status);
        const responseText = await response.text();
        console.log('API Response text:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Chyba při parsování JSON odpovědi:', e);
            throw new Error('Nevalidní JSON odpověď z API');
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            message: 'Chyba při komunikaci s Ecomail API',
            error: error.message 
        });
    }
});

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
});
