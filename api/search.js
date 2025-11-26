// api/search.js - Simple working version
module.exports = async (req, res) => {
    console.log('API called with:', req.method, req.query);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q, categories, language, safesearch } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        // Return successful response with dummy data
        return res.status(200).json({
            results: [
                {
                    title: `Search result for: ${q}`,
                    url: 'https://example.com/result1',
                    content: `This is a search result about ${q}. Your API is working!`,
                    engine: 'fera'
                },
                {
                    title: `More info about ${q}`,
                    url: 'https://example.com/result2',
                    content: `Additional information about ${q} from the search.`,
                    engine: 'fera'
                }
            ],
            query: q,
            number_of_results: 2
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};
