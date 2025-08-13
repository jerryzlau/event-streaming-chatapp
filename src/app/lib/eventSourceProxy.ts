import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ProxyConfig = {
  targetUrl: string;
  headers?: Record<string, string>;
};

type ProxyMethod = 'GET' | 'POST';

export const eventSourceProxy = (config: ProxyConfig, method: ProxyMethod) => {
  return async (request: Request) => {
    try {
      const target = new URL(config.targetUrl);
      const incoming = new URL(request.url);
      incoming.searchParams.forEach((value, key) => {
        target.searchParams.append(key, value);
      });

      const response = await fetch(target.toString(), {
        method,
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
