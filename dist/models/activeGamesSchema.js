"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const playerSchema = new Schema({
    info: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isAlive: { type: Boolean, required: true },
    role: { type: String, required: true },
    numActionsLeft: { type: Number, required: true, min: 0 }
});
const eventSchema = new Schema({
    by: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true }
});
const activeGameSchema = new Schema({
    name: { type: String, required: true },
    roles: { type: String, required: true },
    players: { type: [playerSchema], required: true },
    numPlayersJoined: { type: Number, required: true },
    numPlayersMax: { type: Number, required: true },
    log: { type: [eventSchema], required: true },
    library: { type: String, required: true }
});
