"use client";

import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setChatHistory([...chatHistory, `You: ${message}`]);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({ prompt: message }),
      });

      const data = await response.json();
      console.log("AI: ", data);

      if (data.response) {
        setChatHistory((prev) => [...prev, `AI: ${data.response}`]);
      }
    } catch (error) {
      console.error("Error fetching AI response: ", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container flex flex-col justify-between h-full max-w-lg mx-auto bg-black text-green-500 rounded-lg shadow-lg p-4 font-mono border-2 border-green-500">
      {/* Chat History */}
      <div className="chat-history flex-grow overflow-y-auto mb-4 max-h-[400px]">
        {chatHistory.map((msg, index) => (
          <div key={index} className="message p-1 border-b border-green-500">
            <p>{msg}</p>
          </div>
        ))}
      </div>

      {/* Typing box and send button */}
      <div className="flex items-center border-t-2 border-green-500 pt-2">
        <textarea 
          className="flex-grow p-2 border rounded-lg bg-black text-green-500 border-green-500 resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button
          className="ml-2 p-2 rounded-full bg-green-500 text-black"
          onClick={sendMessage}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;