import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2, MapPin, Hotel, Plane, Package, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function AIAssistantPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI Travel Assistant. I can help you with:\n\n• **Plan personalized trips** based on your preferences\n• **Find hotels** with real-time availability and pricing\n• **Book flights** and compare prices\n• **Suggest destinations** similar to places you love\n• **Track prices** and alert you of deals\n• **Provide travel tips** and local recommendations\n\nWhat would you like to explore today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Simple response since AI integration is not available
      const assistantMessage = {
        role: "assistant",
        content: `Thank you for your question! I'd love to help you with: "${input}"

However, the AI assistant feature requires integration with an LLM service (like OpenAI or Google Gemini).

For now, I can help you with:
• **Browse Hotels** - Check out our available hotels
• **View Packages** - Explore travel packages
• **Search Flights** - Find available flights
• **Plan Trips** - Use the Trip Planner to organize your journey

Would you like me to show you our available hotels or travel packages?`
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: MapPin, label: "Plan a trip", query: "Help me plan a 5-day trip to a beach destination" },
    { icon: Hotel, label: "Find hotels", query: "Show me luxury hotels in Paris for next month" },
    { icon: Plane, label: "Book flights", query: "Find me the cheapest flights to Tokyo in December" },
    { icon: Package, label: "View packages", query: "What are the best honeymoon packages available?" },
    { icon: DollarSign, label: "Track prices", query: "Help me find the best deals and save money on my next trip" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Travel Assistant</h1>
          <p className="text-xl text-gray-600">Your personal travel expert powered by AI</p>
        </motion.div>

        {/* Chat Container */}
        <Card className="shadow-2xl border-0 mb-6">
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-blue-600">{children}</strong>,
                              a: ({ children, ...props }) => (
                                <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-white">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-3 mb-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything about travel..."
                  className="flex-1 h-12"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(action.query)}
                      className="text-xs"
                      disabled={loading}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: MapPin,
              title: "Personalized Planning",
              description: "Get trip plans based on your history and preferences"
            },
            {
              icon: DollarSign,
              title: "Smart Savings",
              description: "Track prices and get alerts for the best deals"
            },
            {
              icon: Sparkles,
              title: "Real-time Data",
              description: "Access live availability, pricing, and recommendations"
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}