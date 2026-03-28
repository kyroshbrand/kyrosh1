import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  name: string;
  phone: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "bot"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

// Prevent model recompilation in dev
export const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
