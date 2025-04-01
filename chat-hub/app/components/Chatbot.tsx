"use client";

import { useState } from "react";
import { FaPaperPlane, FaImage, FaFileAlt } from "react-icons/fa";

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
        headers: { "Contet-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ prompt: message }),
      });

      const data = await response.json();
      console.log("AI Response: ", data);

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

  const handleFileUpload = async (file: File, endpoint: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://127.0.0.1:8000/upload/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("File Upload Response: ", data);

      if (data.response) {
        setChatHistory((prev) => [...prev, `AI: ${data.response}`]);
      }
    } catch (error) {
      console.error("Error Uploading file: ", error);
    }
  };

  return (
    <div className="chatbot-container flex flex-col justify-between h-full w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-4 text-blue-500">
      {/* Chat history display */}
      <div className="chat-history flex-grow overflow-y-auto mb-4 max-h-[400px]">
        {chatHistory.map((msg, index) => (
          <div key={index} className="message p-2">
            <p>{msg}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center border-t-2 pt-2">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "image")}
        />
        <label htmlFor="image-upload" className="cursor-pointer p-2">
          <FaImage size={20} className="text-blue-500" />
        </label>

        <input
          type="file"
          id="document-upload"
          accept=".pdf,.txt,.docx"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "document")}
        />
        <label htmlFor="document-upload" className="cursor-pointer p-2">
          <FaFileAlt size={20} className="text-blue-500" />
        </label>

        <textarea
          className="flex-grow p-2 border rounded-lg resize-none text-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button
          className="ml-2 p-2 rounded-full bg-blue-500 text-white"
          onClick={sendMessage}
        >
          <FaPaperPlane />
        </button>
      </div>

    </div>
  );
};

export default Chatbot;