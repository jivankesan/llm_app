import React, { useState, useEffect, useRef } from "react";
import { ArrowUpIcon } from "lucide-react";
import apiClient from "../services/api";

/**
 * A small helper to auto-resize our textarea as the user types.
 */
function AutoResizeTextarea({ value, onChange, className = "", ...props }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      rows={1}
      className={`resize-none overflow-hidden ${className}`}
      {...props}
    />
  );
}

const ChatWithFile = () => {
  const [userId, setUserId] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // Handle file change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Send user's message & file
  const handleSend = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    // Build form data
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("user_query", userQuery);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    // Add the user's message + a "Generating response..." placeholder
    const userMessage = { user: "You", text: userQuery };
    const placeholderMsg = { user: "AI", text: "Generating response..." };

    // We'll insert both into the chat at once
    const updatedChat = [...chatHistory, userMessage, placeholderMsg];
    // The placeholder message is at the last index
    const placeholderIndex = updatedChat.length - 1;

    setChatHistory(updatedChat);

    try {
      // POST to FastAPI backend
      const response = await apiClient.post("/chat/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Replace placeholder with the real bot response
      const botMessage = { user: "AI", text: response.data.response };
      setChatHistory((prev) => {
        const newState = [...prev];
        newState[placeholderIndex] = botMessage;
        return newState;
      });
    } catch (error) {
      console.error("Error generating response:", error);
      alert("Error generating response");

      // Replace placeholder with an error bubble
      setChatHistory((prev) => {
        const newState = [...prev];
        newState[placeholderIndex] = {
          user: "AI",
          text: "Error generating response.",
        };
        return newState;
      });
    } finally {
      // Clear out the user input/file in either case
      setUserQuery("");
      setSelectedFile(null);
    }
  };

  // Submit on Enter (unless shift is held)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // If no messages, show a header
  const header = (
    <header className="m-auto flex h-full flex-col justify-center gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Welcome to TES
      </h1>
      <p className="text-sm text-gray-500">
        Enter your TD User ID and upload a file or type a message to chat with
        the AI
      </p>
    </header>
  );

  // Otherwise, show the message bubbles
  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {chatHistory.map((msg, idx) => {
        const isUser = msg.user === "You";
        return (
          <div
            key={idx}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              isUser
                ? "self-end bg-blue-500 text-white"
                : "self-start bg-gray-100 text-black"
            }`}
          >
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        );
      })}
    </div>
  );

  return (
    <main className="mx-auto flex h-screen w-screen flex-col items-stretch border-none bg-white text-gray-900 shadow rounded-md overflow-hidden">
      {/* Scrollable area for messages, centered with same width as form */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex justify-center">
        <div className="w-1/2">{chatHistory.length ? messageList : header}</div>
      </div>

      {/* The form, also centered at w-1/2 */}
      <form
        onSubmit={handleSend}
        className="mx-auto w-1/2 mb-6 flex flex-col gap-2 rounded-[16px] border border-gray-300 px-3 py-3 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-300/50 focus-within:ring-offset-0 bg-gray-50"
      >
        {/* User ID */}
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter TD User ID"
          className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none"
        />

        {/* File input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-100 file:py-1 file:px-2 file:text-blue-700 hover:file:bg-blue-200 focus:outline-none"
        />

        {/* Text area + send button row */}
        <div className="relative flex items-center">
          <AutoResizeTextarea
            value={userQuery}
            onChange={setUserQuery}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-gray-200 bg-white p-2 text-gray-700 focus:outline-none"
          />
          <button type="submit" title="Send">
            <ArrowUpIcon className="text-white" size={16} />
          </button>
        </div>
      </form>
    </main>
  );
};
