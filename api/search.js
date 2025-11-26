// api/search.js - SUPER SIMPLE TEST
module.exports = async (req, res) => {
    console.log('API called with query:', req.query);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Return immediate success response
    return res.status(200).json({
        success: true,
        message: 'API is working!',
        query: req.query.q,
        receivedParams: req.query,
        results: [
            {
                title: 'Test Result 1',
                url: 'https://search.inetol.net/',
                content: 'This is a test result from the API.'
            },
            {
                title: 'Test Result 2', 
                url: 'https://example.com/',
                content: 'Another test result.'
            }
        ]
    });
};
