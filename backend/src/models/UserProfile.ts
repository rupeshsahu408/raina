import mongoose from "mongoose";

export type SelectedPersonality = "Simi" | "Loa";

export interface UserProfileDoc {
  uid: string;
  email?: string;
  name?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  languagePreference?: "hindi" | "english" | "hinglish" | null;
  selectedPersonality?: SelectedPersonality | null;
  mood?: string | null;
  preferences?: string[];
  interests?: string[];
  goals?: string[];
  habits?: string[];
  about?: {
    nickname?: string | null;
    occupation?: string | null;
    moreAboutYou?: string | null;
  };
  personalization?: {
    theme?: "light" | "dark" | "auto";
    accentColor?: string | null;
    fontSize?: "small" | "medium" | "large";
    bubbleStyle?: "rounded" | "sharp";
    backgroundStyle?: "gradient" | "image";
    typingSpeed?: "slow" | "normal" | "fast";
  };
  memorySettings?: {
    allowMemory?: boolean;
    referenceChatHistory?: boolean;
  };
  privacy?: {
    incognitoChatMode?: boolean;
  };
  notifications?: {
    enabled?: boolean;
  };
  memorySummary?: {
    goals: string[];
    habits: string[];
    repeatedTopics: string[];
    lastUpdatedAt?: Date | null;
  };
  usage?: {
    dayKey?: string | null;
    messagesToday: number;
    webSearchesToday: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new mongoose.Schema<UserProfileDoc>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: false },
    name: { type: String, default: null },
    photoUrl: { type: String, default: null },
    bio: { type: String, default: null },
    languagePreference: {
      type: String,
      enum: ["hindi", "english", "hinglish", null],
      default: null,
    },
    selectedPersonality: { type: String, default: "Simi" },
    mood: { type: String, default: null },
    preferences: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    goals: { type: [String], default: [] },
    habits: { type: [String], default: [] },
    about: {
      nickname: { type: String, default: null },
      occupation: { type: String, default: null },
      moreAboutYou: { type: String, default: null },
    },
    personalization: {
      theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
      accentColor: { type: String, default: "#7c3aed" },
      fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
      bubbleStyle: { type: String, enum: ["rounded", "sharp"], default: "rounded" },
      backgroundStyle: { type: String, enum: ["gradient", "image"], default: "gradient" },
      typingSpeed: { type: String, enum: ["slow", "normal", "fast"], default: "normal" },
    },
    memorySettings: {
      allowMemory: { type: Boolean, default: true },
      referenceChatHistory: { type: Boolean, default: true },
    },
    privacy: {
      incognitoChatMode: { type: Boolean, default: false },
    },
    notifications: {
      enabled: { type: Boolean, default: true },
    },
    memorySummary: {
      goals: { type: [String], default: [] },
      habits: { type: [String], default: [] },
      repeatedTopics: { type: [String], default: [] },
      lastUpdatedAt: { type: Date, default: null },
    },
    usage: {
      dayKey: { type: String, default: null },
      messagesToday: { type: Number, default: 0 },
      webSearchesToday: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<UserProfileDoc>(
  "UserProfile",
  UserProfileSchema
);

