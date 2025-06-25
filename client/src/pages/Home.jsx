import React from "react";
import ChatWidget from "../components/ChatWidget";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          EduTech Foundation
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Ask our chatbot about our educational technology solutions
        </p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Our Services Include:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <p className="text-gray-600">• Camera Based Attendance</p>
              <p className="text-gray-600">• Auto Time Table Generation</p>
              <p className="text-gray-600">• Student Quiz Generation</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">• Role-Based Access Control</p>
              <p className="text-gray-600">• Course Management System</p>
              <p className="text-gray-600">• 24/7 Chatbot Support</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-indigo-800 font-medium">
              💬 Click the chat icon in the bottom right to learn more!
            </p>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Home;
