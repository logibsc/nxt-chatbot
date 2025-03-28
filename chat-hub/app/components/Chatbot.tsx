"use client"; 

import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() === "") return;

    setMessages([...messages, `You: ${input}`]);
    setInput(""); 
  };

  return (
    <div className="w-96 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2 text-blue-600">Chatbot</h2>
      <div className="h-48 overflow-y-auto border p-2 rounded mb-2 bg-gray-100">
        {messages.map((msg, index) => (
          <p key={index} className="text-sm text-blue-600">{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 w-full rounded text-blue-600"
        placeholder="Type a message..."
      />
      <button
        onClick={sendMessage}
        className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
      >
        Send
      </button>
    </div>
  );
}
