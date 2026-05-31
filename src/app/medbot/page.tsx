"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Loader2,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
  structuredResponse?: {
    response: string;
    analysis: {
      symptomAnalysis: string;
      specialistType: string;
      urgencyLevel: string;
    };
    context: string;
  };
};

type QuickReply = {
  id: string;
  text: string;
};

export default function MedbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationContext, setConversationContext] = useState(
    "Initial conversation",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content:
          "Hi! I'm MedBot, your medical assistant. I'm here to help understand your symptoms and recommend appropriate medical specialists. What health concerns can I help you with today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const quickReplies: QuickReply[] = [
    { id: "q1", text: "I have a headache" },
    { id: "q2", text: "Stomach pain" },
    { id: "q3", text: "Skin rash" },
    { id: "q4", text: "Joint pain" },
    { id: "q5", text: "Feeling anxious" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        content: "",
        sender: "bot",
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      const response = await fetch("/api/medbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationContext: conversationContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setConversationContext(data.response.context || conversationContext);

      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: (Date.now() + 2).toString(),
            content: data.response.response,
            sender: "bot",
            timestamp: new Date(),
            structuredResponse: data.response,
          }),
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: (Date.now() + 2).toString(),
            content:
              "I apologize, but I'm having trouble processing your request. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          }),
      );
    }
  };

  const handleQuickReply = async (text: string) => {
    setInput(text);
    await handleSend();
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Back</span>
            </Link>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Online
              </Badge>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/medbot-avatar.png" alt="MedBot" />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">MedBot Assistant</p>
                <p className="text-xs text-muted-foreground">
                  AI Healthcare Guide
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src="/medbot-avatar.png" alt="MedBot" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[80%] ${message.sender === "user" ? "order-1" : "order-2"}`}
              >
                <Card
                  className={`${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-white"}`}
                >
                  <CardContent className="p-4">
                    {message.isLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm md:text-base">
                          {message.content}
                        </p>

                        {/* Show recommendations only when specialist type is available */}
                        {message.structuredResponse?.analysis
                          ?.specialistType && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-blue-800">
                                  Medical Assessment
                                </p>
                                <p className="text-sm text-blue-700">
                                  {
                                    message.structuredResponse.analysis
                                      .symptomAnalysis
                                  }
                                </p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-sm font-medium text-blue-800">
                                  Recommended Specialist
                                </p>
                                <p className="text-sm text-blue-700">
                                  {
                                    message.structuredResponse.analysis
                                      .specialistType
                                  }
                                </p>
                              </div>

                              {message.structuredResponse.analysis
                                .urgencyLevel && (
                                <Alert
                                  variant="destructive"
                                  className="mt-2 bg-red-50 border-red-200"
                                >
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-600">
                                    {
                                      message.structuredResponse.analysis
                                        .urgencyLevel
                                    }
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        )}

                        {message.sender === "bot" && (
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {message.sender === "user" && (
                <Avatar className="h-8 w-8 ml-2 mt-1">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="User"
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length < 3 && (
        <div className="bg-white border-t p-3">
          <div className="container max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-2">
              Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply.text)}
                  className="rounded-full"
                >
                  {reply.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-t p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your symptoms or health concerns..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={input.trim() === ""}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            MedBot provides general guidance only. Always consult with a
            healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
