"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenGame = exports.openGameSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const rolesConfig_1 = require("../rolesConfig");
const Schema = mongoose_1.default.Schema;
const playerSchema = new Schema({
    playerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    username: { type: String, required: true }
});
;
exports.openGameSchema = new Schema({
    name: { type: String, required: true },
    roles: [{ type: String, enum: rolesConfig_1.RoleArray, required: true }],
    players: [{ type: playerSchema, required: true }],
    numPlayersJoined: { type: Number, required: true },
    numPlayersMax: { type: Number, required: true }
});
exports.OpenGame = mongoose_1.default.model('OpenGame', exports.openGameSchema);
