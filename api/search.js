import fetch from 'node-fetch';

// The specific SearXNG instance
const SEARXNG_URL = 'https://search.inetol.net/';

/**
 * Vercel Serverless Function to proxy requests to SearXNG.
 */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Extract query parameters
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`SearXNG returned status: ${response.status}`);
        }

        // Check if the response is valid JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            console.error("SearXNG returned non-JSON:", errorText.substring(0, 200));
            return res.status(502).json({ 
                error: 'Search service returned non-JSON response',
                status: response.status
            });
        }
        
        // 4. Parse the JSON and return it to the frontend
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ 
            error: 'Failed to communicate with search service', 
            details: error.message 
        });
    }
}
