"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.userSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
exports.userSchema = new Schema({
    username: { type: String, unique: true, required: true, dropDups: true },
    email: { type: String, unique: true, required: true, dropDups: true },
    hashedPassword: { type: String, required: true },
    isVerified: Boolean,
    signature: String,
    picture: String,
    wins: Number,
    losses: Number
});
exports.User = mongoose_1.default.model('User', exports.userSchema);
