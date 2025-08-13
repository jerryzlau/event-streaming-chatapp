'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import classNames from 'classnames';

interface Message {
  id?: string;
  time?: string;
  message: string;
  type: 'user' | 'assistant';
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   
    // Append user input to messages and reset input
    setMessages((prevMessages) => [...prevMessages, { message: input, type: 'user' }]);
    setInput('');

    setIsLoading(true);

    const eventSource = new EventSource(`/api/chat?input=${input}`);

    eventSource.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      if (data.message === '[DONE]') {
        eventSource.close();
        return;
      }
      
      setIsLoading(false);

      const { id, message } = data;

      setMessages((prev) => {
        const updated = [...prev];
        let idx = updated.findIndex((msg) => msg.id === id);
        if (idx === -1) {
          updated.push({ id, message, type: 'assistant' });
          return updated;
        }
        updated[idx] = { ...updated[idx], message: (updated[idx].message || '') + message, id };
        return updated;
      });
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
      setIsLoading(false);
    };
  }

  const shouldRenderMessages = messages.length > 0;

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Stream</h1>
      <div className="flex flex-col relative h-[600px] overflow-y-auto border border-gray-200 rounded-lg p-4">
         {
          shouldRenderMessages && messages.map((msg, index) => {
            const isUserMessage = msg.type === 'user';
            
            if (msg.message === '') {
              return null;
            }

            return (
              <div key={msg.id || index} className={classNames("mb-2 p-2 rounded whitespace-pre-wrap m-4 w-fit", {
                "bg-white text-black ml-auto text-right": isUserMessage,
                "text-white mr-auto text-left": !isUserMessage
              })}>
                <ReactMarkdown>{msg.message}</ReactMarkdown>
              </div>
            )
          })
        }
          {isLoading && (
            <div className="absolute bottom-2 right-2">
              <div className="flex items-center gap-2 text-gray-500 bg-white/70 backdrop-blur rounded px-2 py-1 shadow">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}
        <div ref={bottomRef} />
      </div>
      <div className="mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default Chat;