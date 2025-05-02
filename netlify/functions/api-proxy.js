const axios = require('axios');

exports.handler = async function(event, context) {
  // Configure CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get the path parameter from the event
    const path = event.path.replace('/.netlify/functions/api-proxy', '');
    
    // Parse query parameters
    const queryString = event.queryStringParameters 
      ? Object.keys(event.queryStringParameters)
          .map(key => `${key}=${encodeURIComponent(event.queryStringParameters[key])}`)
          .join('&')
      : '';
    
    // Build the target URL correctly with proper handling of path and query parameters
    let url = `http://peoplepulse.diu.edu.bd:8189/result`;
    
    // Handle paths like /semesterList or /studentInfo correctly
    if (path && path !== '/') {
      url += path;
    }
    
    // Add query parameters if available
    if (queryString) {
      url += `?${queryString}`;
    }
    
    console.log(`Proxying request to: ${url}`);

    // Forward the request to the actual API
    const response = await axios({
      method: event.httpMethod,
      url: url,
      headers: {
        'Accept': 'application/json',
        // Filter out headers that might cause issues
        ...(event.headers ? 
          Object.fromEntries(
            Object.entries(event.headers).filter(([key]) => 
              !['host', 'connection', 'content-length'].includes(key.toLowerCase())
            )
          ) : {})
      },
      data: event.body ? JSON.parse(event.body) : undefined,
      timeout: 15000 // 15 second timeout
    });

    // Return the API response
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('API proxy error:', error.message);
    
    // Return an appropriate error response
    return {
      statusCode: error.response?.status || 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || 'Internal Server Error'
      })
    };
  }
};