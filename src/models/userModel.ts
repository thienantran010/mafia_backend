import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Schema = mongoose.Schema;

export interface UserInterface {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    hashedPassword: string;
    isVerified: boolean;
    signature?: string;
    picture?: string;
    wins?: number;
    losses?: number;
}
export const userSchema = new Schema<UserInterface>({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    hashedPassword: {type: String, required: true},
    isVerified: Boolean,
    signature: String,
    picture: String,
    wins: Number,
    losses: Number
}).plugin(uniqueValidator);

export const User = mongoose.model<UserInterface>('User', userSchema);