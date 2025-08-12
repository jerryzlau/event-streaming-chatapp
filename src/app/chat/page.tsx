'use client';

import { useEffect, useState } from 'react';

interface Message {
  time?: string;
  message: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/chat');

    eventSource.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    eventSource.onerror = (error) => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Stream</h1>
      <div className="h-[600px] overflow-y-auto border border-gray-200 rounded-lg p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-gray-500">
            {msg.time && (
              <span className="text-sm text-gray-500">
                [{new Date(msg.time).toLocaleTimeString()}]
              </span>
            )}{' '}
            {msg.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;