import { Router, Request, Response } from 'express';
import { chatCompletionStream } from './providers/openai';

const router = Router();

router.get('/api/chat', (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { input } = req.query as { input?: string };

  if (!input) {
    res.write(`data: ${JSON.stringify({ message: 'Missing input' })}\n\n`);
    return res.end();
  }

  (async () => {
    const delayMs = Number((req.query as any).delayMs ?? 100);
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const stream = await chatCompletionStream({ input });
    if (!stream) {
      res.write(`data: ${JSON.stringify({ message: 'Failed to start stream' })}\n\n`);
      return res.end();
    }

    for await (const chunk of stream as any) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) {
        await sleep(delayMs);
        res.write(`data: ${JSON.stringify({ id: chunk?.id, message: delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ message: '[DONE]' })}\n\n`);
    res.end();
  })();
  
  req.on('close', () => {
    console.log('Client disconnected');
  });
});

export default router;
