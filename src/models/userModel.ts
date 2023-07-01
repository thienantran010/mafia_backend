import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface UserDocument extends mongoose.Document {
    username: string;
    email: string;
    hashedPassword: string;
    isVerified: boolean;
    signature?: string;
    picture?: string;
    wins?: number;
    losses?: number;
}
export const userSchema = new Schema<UserDocument>({
    username: {type: String, unique: true, required: true, dropDups: true},
    email: {type: String, unique: true, required: true, dropDups: true},
    hashedPassword: {type: String, required: true},
    isVerified: Boolean,
    signature: String,
    picture: String,
    wins: Number,
    losses: Number
})

export const User = mongoose.model<UserDocument>('User', userSchema);