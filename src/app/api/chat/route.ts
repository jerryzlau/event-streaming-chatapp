import { eventSourceProxy } from '@/app/lib/eventSourceProxy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create a proxy handler for the chat endpoint
export const GET = eventSourceProxy({
  targetUrl: 'http://localhost:3001/api/chat',
}, 'GET');

export const POST = eventSourceProxy({
  targetUrl: 'http://localhost:3001/api/chat',
}, 'POST');