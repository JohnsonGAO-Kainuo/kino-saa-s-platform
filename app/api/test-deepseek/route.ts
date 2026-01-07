// Diagnostic endpoint to test DeepSeek API connectivity
export async function GET() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return Response.json({ 
        status: 'error',
        message: 'DEEPSEEK_API_KEY environment variable is not set',
        hasKey: false
      }, { status: 500 });
    }

    // Test direct API call
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: 'Reply with just "OK" if you are working.'
          }
        ],
        max_tokens: 10
      })
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      return Response.json({
        status: 'error',
        message: 'DeepSeek API returned an error',
        hasKey: true,
        keyPrefix: apiKey.substring(0, 10) + '...',
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseBody: responseText
      }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    
    return Response.json({
      status: 'success',
      message: 'DeepSeek API is working correctly',
      hasKey: true,
      keyPrefix: apiKey.substring(0, 10) + '...',
      testResponse: data.choices[0]?.message?.content || 'No content'
    });

  } catch (error: any) {
    return Response.json({
      status: 'error',
      message: 'Unexpected error during test',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

