import fetch from 'node-fetch';

// The specific SearXNG instance the user requested
const SEARXNG_URL = 'https://searx.rhscz.eu';

/**
 * Vercel Serverless Function to proxy requests to SearXNG.
 * This is the correct way to reliably fetch data from third-party APIs,
 * preventing CORS issues and handling potential HTML errors from the source.
 * * @param {import('http').IncomingMessage} req The request object.
 * @param {import('http').ServerResponse} res The response object.
 */
export default async function (req, res) {
    // 1. Extract query parameters from the Vercel function URL (e.g., /api/search?q=...)
    const { q, category, language, safesearch, type } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }
    
    // Determine the SearXNG endpoint to call (always /search)
    const searxPath = '/search';
    
    // 2. Build the request URL for the external SearXNG instance
    const params = new URLSearchParams({
        q: q,
        categories: category || 'general', // Use provided category or default to 'general'
        language: language || 'en',        // Use provided language or default to 'en'
        safesearch: safesearch || '1',     // Use provided safesearch or default to 'moderate' (1)
        format: 'json'                     // CRITICAL: Always request JSON format
    });

    const externalUrl = `${SEARXNG_URL}${searxPath}?${params.toString()}`;

    try {
        // 3. Make the request from the Vercel server
        const response = await fetch(externalUrl);

        // Check if the response is valid JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            // This catches the HTML error you saw!
            const errorText = await response.text();
            console.error("SearXNG returned non-JSON content:", errorText.substring(0, 100));
            return res.status(502).json({ 
                error: 'SearXNG did not return JSON. It might be down or rejected the request.',
                status: response.status
            });
        }
        
        // 4. If valid, parse the JSON and return it to the frontend
        const data = await response.json();
        
        // Add CORS headers to the response sent to the frontend (though Vercel handles most)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Content-Type', 'application/json');

        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ 
            error: 'Failed to communicate with the external search service.', 
            details: error.message 
        });
    }
}
