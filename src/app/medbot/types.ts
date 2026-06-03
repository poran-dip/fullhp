export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export interface ChatProps {
  initialMessages?: Message[];
}

export interface MessageProps {
  message: Message;
}
