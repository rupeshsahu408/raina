"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
let mongoPromise = null;
async function connectMongo() {
    if (mongoPromise)
        return mongoPromise;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("Missing MONGODB_URI in backend environment.");
    }
    mongoPromise = mongoose_1.default.connect(uri);
    return mongoPromise;
}
