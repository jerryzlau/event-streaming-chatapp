import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;
const model = process.env.OPENAI_MODEL || 'gpt-5';

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY in environment');
}

const client = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});

type ChatInput = {
  input: string;
};

export const chatCompletionStream = async ({ input }: ChatInput): Promise<AsyncIterable<any> | undefined> => {
  try {
    const stream = await client.chat.completions.create({
      model,
      stream: true,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Return your response in markdown format.' },
        { role: 'user', content: input },
      ],
    });
    return stream as unknown as AsyncIterable<any>;
  } catch (error) {
    console.error('Error creating chat completion (stream):', error);
  }
};
