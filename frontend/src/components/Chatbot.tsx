import React, { useState } from 'react';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string, isBot: boolean }[]>([
    { text: "Hi! I'm your HR AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages([...messages, { text: userMsg, isBot: false }]);
    setInput("");

    // Simple mock response logic (to be replaced by AI service later)
    setTimeout(() => {
      let botResponse = "I'm still learning. Please contact HR for complex queries.";
      if (userMsg.toLowerCase().includes("leave")) {
        botResponse = "You can apply for leave in the Leave section. Your current balance is 15 days.";
      } else if (userMsg.toLowerCase().includes("payroll")) {
        botResponse = "Payslips are generated monthly. You can download your latest one in the Payroll section.";
      }
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="card w-80 h-96 flex flex-col shadow-2xl animate-slide-up border-indigo-100 overflow-hidden">
          <div className="bg-indigo-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span>🤖</span> HR AI Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-indigo-100 hover:text-white">✕</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.isBot 
                  ? 'bg-white text-slate-800 rounded-tl-none shadow-sm' 
                  : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="flex-1 text-xs py-2"
            />
            <button onClick={handleSend} className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
              ➤
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-all duration-300 animate-bounce"
        >
          🤖
        </button>
      )}
    </div>
  );
};

export default Chatbot;
