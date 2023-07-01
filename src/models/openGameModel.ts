import mongoose from 'mongoose';
import { userSchema } from './userModel';

const Schema = mongoose.Schema;

export interface OpenGameDocument extends mongoose.Document {
    name: string;
    roles: string[];
    players: mongoose.Types.ObjectId[];
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