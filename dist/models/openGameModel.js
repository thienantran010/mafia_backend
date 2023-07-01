"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenGame = exports.openGameSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
;
exports.openGameSchema = new Schema({
    name: { type: String, required: true },
    roles: [{ type: String, required: true }],
    players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    numPlayersJoined: { type: Number, required: true },
    numPlayersMax: { type: Number, required: true }
});
exports.OpenGame = mongoose_1.default.model('OpenGame', exports.openGameSchema);
