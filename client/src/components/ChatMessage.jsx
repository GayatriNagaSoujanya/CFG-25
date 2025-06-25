import React from "react";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs rounded-lg p-3 ${
          isUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-indigo-200" : "text-gray-500"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
