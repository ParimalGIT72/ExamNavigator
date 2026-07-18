import React, { useState } from 'react';
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { FaPaperPlane, FaRobot, FaSmile, FaTools, FaSun, FaMoon } from "react-icons/fa";
import './index.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://130deea9a0db.ngrok-free.app/api/chat";
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => null);
        console.error("Chat API error", res.status, res.statusText, bodyText);
        setMessages([...newMessages, { from: "bot", text: `Server error (${res.status}): ${res.statusText}` }]);
        return;
      }

      const data = await res.json();
      setMessages([...newMessages, { from: "bot", text: data?.response || "No response" }]);
    } catch (err) {
      setMessages([...newMessages, { from: "bot", text: "Error contacting server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const wallpaper = darkMode
    ? 'bg-gradient-to-r from-gray-900 to-gray-800'
    : 'bg-cover bg-center';

  return (
    <div
      className={`flex min-h-screen ${darkMode ? "bg-gray-900 text-white" : "text-gray-800"}`}
      style={{
        backgroundImage: !darkMode ?
          'url("https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1470&q=80")' :
          'none',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <aside className={`w-60 p-4 border-r ${darkMode ? "border-gray-700 bg-gray-800" : "bg-white/80 backdrop-blur"}`}>
        <h2 className="text-lg font-bold mb-4">📚 Subjects</h2>
        <ul className="space-y-2">
          <li className="hover:text-blue-500 cursor-pointer">Physics</li>
          <li className="hover:text-blue-500 cursor-pointer">Chemistry</li>
          <li className="hover:text-blue-500 cursor-pointer">Maths</li>
          <li className="hover:text-blue-500 cursor-pointer">Biology</li>
        </ul>
      </aside>

      <div className="flex flex-col flex-1">
        <header className={`p-4 shadow flex justify-between items-center ${darkMode ? "bg-gray-800 text-white" : "bg-white/80 backdrop-blur text-blue-700"}`}>
          <div className="flex items-center gap-2 text-xl font-bold">
            <FaRobot className="text-2xl" /> ExamNavigator Pro
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 max-w-[90%] ${
                    msg.from === "user"
                      ? "ml-auto justify-end"
                      : "justify-start"
                  }`}
                >
                  {msg.from === "bot" && (
                    <img src="https://api.dicebear.com/7.x/bottts/svg" alt="bot" className="w-8 h-8" />
                  )}
                  <div
                    className={`p-3 rounded-xl ${
                      msg.from === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.from === "user" && (
                    <img src="https://api.dicebear.com/7.x/thumbs/svg" alt="user" className="w-8 h-8" />
                  )}
                </div>
              ))}

              {loading && (
                <div className="bg-gray-200 text-gray-500 p-3 rounded-xl w-fit italic dark:bg-gray-700 dark:text-white">Bot is typing...</div>
              )}
            </div>
          </ScrollArea>
        </main>

        <footer className={`p-4 border-t ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur"}`}>
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
              <span>😊 Add emojis</span>
              <span><FaTools className="inline mr-1" />Tools coming soon</span>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-3 rounded-lg dark:bg-gray-700 dark:text-white"
                title="Emojis"
              >
                <FaSmile />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
              >
                <FaPaperPlane /> Send
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
