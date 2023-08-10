import { User } from '../models/userModel';
import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';

// configuration
dotenv.config();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
sgMail.setApiKey(SENDGRID_API_KEY);
const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY as string;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY as string;

/*******************
* HELPER FUNCTIONS *
*******************/

// to send mail
const sendMail = async (email: string, verificationCode: string) : Promise<void> => {
    if (process.env.MY_EMAIL) {
        const msg = {
            to: email,
            from: process.env.MY_EMAIL,
            subject: 'Verify your Mafia account',
            html: `Click <a href="${process.env.FRONTEND_URL}/verify/${verificationCode}"> here </a> to verify your account!`,
        }
        await sgMail.send(msg);
        console.log('Email sent');
    }
    else {
        console.log("provide a email to send from");
    }
}

// create access token
const createAccessToken = (payload: JwtPayload) => {
    return jwt.sign({ ...payload }, ACCESS_TOKEN_KEY, {
      expiresIn: 3 * 24 * 60 * 60,
    });
};

// create refresh token
const createRefreshToken = (payload: JwtPayload) => {
    return jwt.sign({ ...payload }, REFRESH_TOKEN_KEY, {
        expiresIn: 3 * 24 * 60 * 60,
    });
};

// handle refreshing access token
// if cookie exists, decode the refresh token stored in the cookie
// use the information stored in refresh token to create and send back access token
const refresh = (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(401).json({message: 'Unauthorized'});
    const refreshToken : string = cookies.refreshToken;
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_KEY);
        if (typeof decoded === "object") {

            const handleRefresh = async (decoded : JwtPayload) => {
                const userExists = await User.findById(decoded.id).exec();
                if (!userExists) return res.status(401).json({message: 'Unauthorized'});
                const accessToken = createAccessToken({ id: decoded.id, username: decoded.username });
                const username = userExists.username;
                return { accessToken, username };
            }

            handleRefresh(decoded).then((data) => {
                return res.json(data);
            })
        }
    }

    catch (error) {
        console.log(error);
        return res.status(403).json({ message: 'Forbidden '});
    }
};

// handle login
// compares user-entered password to hashed password
// if they match, send back access token and refresh token
const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({message:'All fields are required'}) // general client error
    }
    try {
        const existingUser = await User.findOne({email: email});
        if (!existingUser) {
            return res.status(400).json({ message: "Email or password is wrong" }); // general client error
        }
        const auth = await bcrypt.compare(password, existingUser.hashedPassword);
        if (!auth) {
            return res.status(400).json({message: "Email or password is wrong"}); // general client error
        }
        const username = existingUser.username;
        const payload = {id: existingUser._id.toString(), username: existingUser.username};
        const accessToken = createAccessToken(payload); 
        const refreshToken = createRefreshToken(payload);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({ accessToken, username });
    }
    catch (error) {
        console.log(error);
    }
};

// handles logout
// clears all cookies
const logout = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(204).json({message: "No refresh token to clear"});
    res.clearCookie(
        'refreshToken',
        {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        }
    )
    res.json({ message: 'Logged out' });
};

// handles registration

const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // if user didn't enter all fields, error
        if (!username || !email || !password) {
            return res.status(400).json({message: "All fields are required."}); // general client error
        }

        const userExists = await User.findOne({email: email}).exec();

        // if user already exists, error
        if (userExists) {
            return res.status(409).json({ message: "User already exists" }); // conflict
        }

        // else create hashed password
        const hashedPassword = await bcrypt.hash(password, 12);
        let user = {
            username: username,
            email: email,
            hashedPassword: hashedPassword,
            isVerified: false, 
        }

        // save new user
        let userRecord = new User(user);
        userRecord = await userRecord.save();
        const recordId = userRecord._id;
        const recordIdString = recordId.toString();

        // send email to verify user email address. they are sent a unique confirmation link
        sendMail(email, recordIdString);
        return res.json({ message: "Check email to confirm your account." });
    }
    catch (error) {
        res.send(error);
    }
};

// handles verification
// link sent in confirmation will call this function
const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { recordId } = req.params;
        const existingUser = await User.findById(recordId).exec();
        if (existingUser) {
            if (existingUser.isVerified === false) {
                existingUser.isVerified = true;
                await existingUser.save();
                return res.json({message: 'Your account has been verified! Please return to login page.'});
            }
            return res.json({message: 'Your account has already been verified. Please return to the login page.'});
        }
        else {
            return res.status(404).json({message: 'this verification code is not tied to any user'}); //not found
        }
    }
    catch (error) {
        console.log(error);
    }
};

export { login, logout, register, verifyEmail, refresh};