import React, { useState, useEffect, useRef } from "react"
import { ArrowUpIcon } from "lucide-react"
import apiClient from "../services/api"

/**
 * A small helper to auto-resize our textarea as the user types.
 */
function AutoResizeTextarea({ value, onChange, className = "", ...props }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      rows={1}
      className={`resize-none overflow-hidden ${className}`}
      {...props}
    />
  )
}

/**
 * ChatWithFile replicates the style/layout of the "Vercel" sample:
 * - A container with a header if no messages
 * - Scrollable message list
 * - Bottom form with ID/File inputs and an auto-resizing textarea
 * - "Send" button with arrow icon
 */
const ChatWithFile = () => {
  const [userId, setUserId] = useState("")
  const [userQuery, setUserQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [chatHistory, setChatHistory] = useState([])

  // Called on file change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  // Submit the user's message + optional file
  const handleSend = async (e) => {
    e.preventDefault()
    if (!userQuery.trim()) return

    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("user_query", userQuery)
    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    // Add the user's message to local state
    const userMessage = { user: "Me", text: userQuery }
    setChatHistory((prev) => [...prev, userMessage])

    try {
      // POST to your FastAPI backend
      const response = await apiClient.post("/chat/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Bot response from server
      const botMessage = { user: "Bot", text: response.data.response }
      setChatHistory((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      alert("Error generating response")
    }

    // Reset input/file
    setUserQuery("")
    setSelectedFile(null)
  }

  // Handle "Enter" key (submit on Enter if shift isn't pressed)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  // If no messages, show a "header" with instructions
  const header = (
    <header className="m-auto flex max-w-md flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">
        Welcome to TES
      </h1>
      <p className="text-sm text-gray-500">
        Upload a file or type a message to chat with the AI
      </p>
    </header>
  )

  // Otherwise, show the message bubbles
  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {chatHistory.map((msg, idx) => {
        const isUser = msg.user === "Me"
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
        )
      })}
    </div>
  )

  return (
    <main
      className="
        mx-auto
        flex
        h-screen
        w-screen
        flex-col
        items-stretch
        border-none
        bg-white
        text-gray-900
        shadow
        rounded-md
        overflow-hidden
      "
    >
      {/* Top area: either show instructions or the message list */}
      <div className="flex-1 content-center overflow-y-auto px-6 py-4">
        {chatHistory.length ? messageList : header}
      </div>

      {/* Bottom form for user ID, file input, and chat text */}
      <form
        onSubmit={handleSend}
        className="
          mx-auto 
          w-1/2
          relative
          mx-6
          mb-6
          flex
          flex-col
          gap-2
          rounded-[16px]
          border
          border-gray-300
          px-3
          py-3
          text-sm
          focus-within:outline-none
          focus-within:ring-2
          focus-within:ring-blue-300/50
          focus-within:ring-offset-0
          bg-gray-50
        "
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

        {/* The text area + send button row */}
        <div className="relative flex items-center">
          <AutoResizeTextarea
            value={userQuery}
            onChange={setUserQuery}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="
              flex-1
              rounded-md
              border
              border-gray-200
              bg-white
              p-2
              text-gray-700
              focus:outline-none
            "
          />

          <button
            type="submit"
            className="
            "
            title="Send"
          >
          <ArrowUpIcon className="text-white" size={16} />
          </button>
        </div>
      </form>
    </main>
  )
}

export default ChatWithFile