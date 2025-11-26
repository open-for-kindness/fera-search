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
        // Build SearXNG URL
        const params = new URLSearchParams({
            q: q,
            categories: categories || 'general',
            language: language || 'en',
            safesearch: safesearch || '1',
            format: 'json'
        });

        const searxngUrl = `https://search.inetol.net/search?${params.toString()}`;

        // Use built-in fetch (available in Node 18+)
        const response = await fetch(searxngUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`SearXNG returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        // Fallback to dummy data
        console.error('Error fetching from SearXNG:', error);
        const dummyData = {
            results: [
                {
                    title: `Fallback result for: ${q}`,
                    url: 'https://example.com/fallback',
                    content: `This is a fallback result because SearXNG is unavailable. Error: ${error.message}`,
                    engine: 'fallback'
                }
            ],
            query: q,
            number_of_results: 1
        };
        return res.status(200).json(dummyData);
    }
};
