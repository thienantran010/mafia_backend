import mongoose from 'mongoose';
import { userSchema } from './userModel';

const Schema = mongoose.Schema;

export interface playerJson {
    id: string;
    username: string;
}
export interface openGameJson {
    id: string;
    name: string;
    roles: string[];
    playerObjs: playerJson[];
    numPlayersJoined: number;
    numPlayersMax: number;
    isInGame?: boolean;
}

export interface OpenGameDocument extends mongoose.Document {
    name: string;
    roles: mongoose.Types.Array<string>;
    players: mongoose.Types.Array<mongoose.Types.ObjectId>;
    numPlayersJoined: number;
    numPlayersMax: number;
};

export const openGameSchema = new Schema<OpenGameDocument>({
    name: {type: String, required: true},
    roles: [{type: String, required: true}],
    players: [{type: Schema.Types.ObjectId, ref: 'User'}],
    numPlayersJoined: {type: Number, required: true},
    numPlayersMax: {type: Number, required: true}
});

export const OpenGame = mongoose.model<OpenGameDocument>('OpenGame', openGameSchema);