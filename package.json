const fetch = require('node-fetch');

// The specific SearXNG instance the user requested
const SEARXNG_URL = 'https://search.inetol.net/';

/**
 * Vercel Serverless Function to proxy requests to SearXNG.
 */
module.exports = async (req, res) => {
    // 1. Extract query parameters from the Vercel function URL
    const { q, categories, language, safesearch, format } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }
    
    // 2. Build the request URL for the external SearXNG instance
    const params = new URLSearchParams({
        q: q,
        categories: categories || 'general',
        language: language || 'en',
        safesearch: safesearch || '1',
        format: format || 'json'
    });

    const externalUrl = `${SEARXNG_URL}search?${params.toString()}`;

    try {
        console.log('Fetching from:', externalUrl);
        
        // 3. Make the request from the Vercel server
        const response = await fetch(externalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Check if the response is valid JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            console.error("SearXNG returned non-JSON:", errorText.substring(0, 200));
            return res.status(502).json({ 
                error: 'SearXNG returned non-JSON response',
                status: response.status
            });
        }
        
        // 4. If valid, parse the JSON and return it to the frontend
        const data = await response.json();
        
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Content-Type', 'application/json');

        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ 
            error: 'Failed to communicate with search service', 
            details: error.message 
        });
    }
};
