"use client";

import { useState } from "react";
import { deflate } from "zlib";

export default function Chatbot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === "") return;
    setMessages([...messages, `You: ${input}`]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({message: input}),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, `AI: ${data.response}`]);
    } catch (error) {
      setMessages((prev) => [...prev, "AI: Sorry. something went wrong."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2 text-blue-600">Chatbot</h2>
      <div className="h-48 overflow-y-auto border p-2 rounded mb-2 bg-gray-100">
        {messages.map((msg, index) => (
          <p key={index} className="text-sm text-blue-600">{msg}</p>
        ))}
        {loading && <p className="text-sm text-gray-500">AI is typing...</p>}
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
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
