import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ProxyConfig = {
  targetUrl: string;
  headers?: Record<string, string>;
};

export const eventSourceProxy = (config: ProxyConfig) => {
  return async () => {
    try {
      const response = await fetch(config.targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...(config.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Proxy target responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body from proxy target');
      }

      // Forward the response with SSE headers
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for Nginx
      });

      return new NextResponse(response.body, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('EventSource proxy error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to connect to event source' }), 
        { 
          status: 502,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}
