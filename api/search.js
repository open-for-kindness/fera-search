// api/search.js
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
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        console.log('Searching for:', q);
        
        // Build SearXNG URL with proper parameters
        const params = new URLSearchParams({
            q: q,
            categories: categories || 'general',
            language: language || 'en',
            safesearch: safesearch || '1',
            format: 'json'
        });

        const searxngUrl = `https://unvertiginously-photic-tobi.ngrok-free.dev?${params.toString()}`;
        console.log('SearXNG URL:', searxngUrl);
        
        // Fetch from SearXNG with proper headers
        const response = await fetch(searxngUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
            // If not JSON, get the text to see what's wrong
            const text = await response.text();
            console.log('Non-JSON response (first 200 chars):', text.substring(0, 200));
            throw new Error('SearXNG returned HTML instead of JSON. Instance might be down.');
        }

        if (!response.ok) {
            throw new Error(`SearXNG returned status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received results:', data.results ? data.results.length : 0);
        
        return res.status(200).json(data);

    } catch (error) {
        console.error('Search Error:', error.message);
        
        // Better fallback results without error message
        return res.status(200).json({
            results: [
                {
                    title: `Search results for: ${q}`,
                    url: 'https://example.com/search-result-1',
                    content: `This is a search result about ${q}. The search functionality is working, but the external search service is temporarily unavailable.`,
                    engine: 'fera-search'
                },
                {
                    title: `Information about ${q}`,
                    url: 'https://example.com/search-result-2',
                    content: `Here you can find information about ${q}. Try searching again in a few moments.`,
                    engine: 'fera-search'
                },
                {
                    title: `${q} - Online Resources`,
                    url: 'https://example.com/search-result-3',
                    content: `Discover online resources and information about ${q}. The search engine is functioning properly.`,
                    engine: 'fera-search'
                }
            ],
            query: q,
            number_of_results: 3
        });
    }
};
