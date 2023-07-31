import mongoose, { Date } from 'mongoose';
import { UserInterface } from './userModel';
import { Role } from '../rolesConfig';
const Schema = mongoose.Schema;

// player-specific library events
interface PlayerEvents {
    [index : string] : string[];
}
// player interfaces
export interface PlayerInterface {
    [username : string] : {
        playerId: mongoose.Types.ObjectId;
        isAlive: boolean;
        toasted: boolean;
        role: Role;
        numActionsLeft: number;
        events: PlayerEvents;
    }
}

export interface playerJson {
    [username : string] : {
        playerId: string;
        isAlive: boolean;
        toasted: boolean;
        role: Role;
        numActionsLeft: number;
        events: PlayerEvents;
    }
}

// message interfaces
export interface MessageInterface {
    username: string;
    content: string;
}

export interface messageJson {
    username: string;
    picture?: string;
    content: string;
}

export interface PlayerInfoInterface {
    [username: string] : {
        picture: string | undefined;
    }
}

export interface action {
    dayVote?: string;
    actionVote?: string;
}

export interface actionJson {
    [username: string]: action;
}

export interface ActionInterface {
    [username : string] : action;
}

export interface ActiveGameInterface {
    _id: mongoose.Types.ObjectId;
    name: string;
    players: PlayerInterface;
    playerInfos: PlayerInfoInterface;
    actions: mongoose.Types.DocumentArray<ActionInterface>;
    library: mongoose.Types.Array<mongoose.Types.Array<string>>;
    allChat: mongoose.Types.DocumentArray<MessageInterface>;
    mafiaChat: mongoose.Types.DocumentArray<MessageInterface>;
    copChat: mongoose.Types.DocumentArray<MessageInterface>;
    startDate: string;
}

type ActiveGameDocumentProps = {
    
}
export const activeGameSchema = new Schema<ActiveGameInterface>({
    name: {type: String, required: true},
    players: {type: Schema.Types.Mixed, required: true},
    playerInfos: {type: Schema.Types.Mixed, required: true},
    actions: [{type: Schema.Types.Mixed, required: true}],
    library: [{type: Schema.Types.Array, required: true}],
    allChat: [new Schema<MessageInterface>({ username: String, content: String})],
    mafiaChat: [new Schema<MessageInterface>({ username: String, content: String})],
    copChat: [new Schema<MessageInterface>({ username: String, content: String})],
    startDate: {type: String, required: true}
});

// player info is only needed to fill out players and messages
export interface activeGameJson {
    id: string;
    name: string;
    players: playerJson;
    actions: actionJson[];
    library: string[][];
    allChat: messageJson[];
    mafiaChat: messageJson[];
    copChat: messageJson[];
    startDate: string;
}
export const ActiveGame = mongoose.model<ActiveGameInterface>('ActiveGame', activeGameSchema);