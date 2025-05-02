const axios = require('axios');

// Helper function to wait for a specified time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Max retries and timeout configuration
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 30000; // 30 seconds

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

    // Get custom timeout from query parameters or use default
    const customTimeout = event.queryStringParameters?.timeout ? 
      parseInt(event.queryStringParameters.timeout) * 1000 : 
      REQUEST_TIMEOUT;

    // Function to make request with retry logic
    const makeRequestWithRetry = async (retryCount = 0) => {
      try {
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
          timeout: customTimeout // Use configured timeout
        });

        // Validate the response data
        if (!response.data || (typeof response.data === 'string' && response.data.trim() === '')) {
          // Handle empty response by throwing an error to trigger retry
          throw new Error('Empty response received from DIU API');
        }

        return response;
      } catch (error) {
        // Check if we should retry
        if (retryCount < MAX_RETRIES) {
          console.log(`Request failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}), retrying in 1 second...`);
          await wait(1000); // Wait 1 second before retrying
          return makeRequestWithRetry(retryCount + 1);
        } else {
          // No more retries, throw the error
          throw error;
        }
      }
    };

    // Forward the request to the actual API with retry logic
    const response = await makeRequestWithRetry();

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