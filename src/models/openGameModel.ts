import mongoose from 'mongoose';
import { Role, RoleArray } from '../rolesConfig';
const Schema = mongoose.Schema;

export interface playerJson {
    id: string;
    username: string;
}

export interface PlayerInterface {
    playerId: mongoose.Types.ObjectId;
    username: string;
}

const playerSchema = new Schema<PlayerInterface>({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    username: {type: String, required: true}
});

export interface openGameJson {
    id: string;
    name: string;
    roles: Role[];
    playerObjs: playerJson[];
    numPlayersJoined: number;
    numPlayersMax: number;
    isInGame?: boolean;
}

export interface OpenGameInterface {
    _id: mongoose.Types.ObjectId;
    name: string;
    roles: mongoose.Types.Array<Role>;
    players: mongoose.Types.DocumentArray<PlayerInterface>;
    numPlayersJoined: number;
    numPlayersMax: number;
};

export const openGameSchema = new Schema<OpenGameInterface>({
    name: {type: String, required: true},
    roles: [{type: String, enum: RoleArray, required: true}],
    players: [{type: playerSchema, required: true}],
    numPlayersJoined: {type: Number, required: true},
    numPlayersMax: {type: Number, required: true}
});

// TMethodsAndOverrides
type OpenGameDocumentProps = {
    players: mongoose.Types.DocumentArray<PlayerInterface>;
};
  
type OpenGameModel = mongoose.Model<OpenGameInterface, {}, OpenGameDocumentProps>;
export const OpenGame = mongoose.model<OpenGameInterface, OpenGameModel>('OpenGame', openGameSchema);