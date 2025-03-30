"use client";

import { useState, useRef } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = { sender: "You", text: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "AI", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        sender: "AI", text: "Error connecting to server."
      }]);
    }
    
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage(input);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_query", "Analyze this file.");

    try {
      const response = await fetch("http://127.0.0.1:8000/upload/document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "AI", text: data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "AI", text: "Error processing file."}]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="h-80 overflow-y-auto p-2 border-gray-300 rounded">
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === "You" ? "text-blue-500" : "text-green-500"}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-400 rounded"
        />
        <button onClick={() => sendMessage(input)} className="bg-blue-500 text-white px-3 py-1 rounded">
          Send
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="bg-gray-500 text-white px-3 py-1 rounded">📎</button>
      </div>
    </div>
  );
};

export default Chatbot;