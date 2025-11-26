// api/search.js - Full SearXNG version
const fetch = require('node-fetch');

const SEARXNG_URL = 'https://search.inetol.net/';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { q, categories, language, safesearch, format } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }
    
    // Build the SearXNG API URL
    const params = new URLSearchParams({
        q: q,
        categories: categories || 'general',
        language: language || 'en',
        safesearch: safesearch || '1',
        format: format || 'json'
    });

    const externalUrl = `${SEARXNG_URL}search?${params.toString()}`;

    try {
        console.log('Fetching from SearXNG:', externalUrl);
        
        const response = await fetch(externalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`SearXNG returned status: ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('SearXNG Proxy Error:', error);
        return res.status(500).json({ 
            error: 'Failed to communicate with search service', 
            details: error.message 
        });
    }
};
