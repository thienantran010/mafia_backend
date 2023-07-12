import mongoose from 'mongoose';
import { UserInterface } from './userModel';
import { Role } from '../rolesConfig';
const Schema = mongoose.Schema;

// player interfaces
export interface PlayerInterface {
    playerId: mongoose.Types.ObjectId;
    username: string;
    isAlive: boolean;
    role: Role;
    numActionsLeft: number;
}

export const playerSchema = new Schema<PlayerInterface>({
    playerId: {type: Schema.Types.ObjectId, required: true},
    username: {type: String, required: true},
    isAlive: {type: Boolean, required: true},
    role: {type: String, required: true},
    numActionsLeft: {type: Number, required: true, min: 0}
});

export interface playerJson {
    username: string;
    isAlive: boolean;
    role: string;
    numActionsLeft: number;
}

// message interfaces
export interface MessageInterface {
    _id: mongoose.Types.ObjectId;
    username: string;
    content: string;
}

// content string should have username inside
// maybe separated with symbols like ${username}messagemessagemessage

export const messageSchema = new Schema<MessageInterface>({
    username: {type: String, required: true},
    content: {type: String, required: true},
})

export interface messageJson {
    username: string;
    picture?: string;
    content: string;
}

// player info interfaces
// these don't change much so embedding is better
// if they do change, we'll just have to remember to manually update them

interface PlayerInfoInterface {
    picture: string | undefined;
}

export type playerInfos = mongoose.Types.Map<PlayerInfoInterface>

export const playerInfoSchema = new Schema({
    playerInfos: {type: Schema.Types.Map, required: true}
})

// active game interfaces
// a player in players is a player's username plus their in-game state
// playerInfo is an array of information about each player used to fill out playerinfo and messages
// when sending the info as json
type ActiveGameDocumentOverrides = {
    players: mongoose.Types.DocumentArray<PlayerInterface>;
    playerInfos: mongoose.Types.Map<PlayerInfoInterface>;
    messages: mongoose.Types.DocumentArray<MessageInterface>;
}

interface action {
    role: Role;
    target: string;
}
type ActiveGameModelType = mongoose.Model<ActiveGameInterface, {}, ActiveGameDocumentOverrides>;
export interface ActiveGameInterface {
    _id: mongoose.Types.ObjectId;
    name: string;
    players: mongoose.Types.DocumentArray<PlayerInterface>;
    playerInfos: mongoose.Types.Map<PlayerInfoInterface>;
    actions: mongoose.Types.Map<action>[];
    library: mongoose.Types.Array<string>;
    messages: mongoose.Types.DocumentArray<MessageInterface>;
}

export const activeGameSchema = new Schema<ActiveGameInterface, ActiveGameModelType>({
    name: {type: String, required: true},
    players: [{type: playerSchema, required: true}],
    playerInfos: {type: Schema.Types.Map, required: true},
    actions: [{type: Schema.Types.Map, required: true}],
    library: [{type: String, required: true}],
    messages: [{type: messageSchema, required: true}]
});

// player info is only needed to fill out players and messages
export interface activeGameJson {
    id: string;
    name: string;
    players: playerJson[];
    actions: Map<string, action>[];
    library: string[];
    messages: messageJson[];
}

export const ActiveGame = mongoose.model<ActiveGameInterface, ActiveGameModelType>('ActiveGame', activeGameSchema);