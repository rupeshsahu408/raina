"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserProfileSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
exports.UserProfile = mongoose_1.default.model("UserProfile", UserProfileSchema);
