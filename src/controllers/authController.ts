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

// data declaration
interface Payload {
    id: string
}


/*******************
* HELPER FUNCTIONS *
*******************/

// to send mail
const sendMail = async (email: string, verificationCode: string) : Promise<void> => {
    const msg = {
        to: email, // Change to your recipient
        from: 'mafiawebappmailer@gmail.com', // Change to your verified sender
        subject: 'Verify your Mafia account',
        html: `Click <a href="${process.env.FRONTEND_URL}/verify/${verificationCode}"> here </a> to verify your account!`,
      }
    try {
        await sgMail.send(msg);
        console.log('Email sent');
    }
    catch (error) {
        console.log(error);
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

/*******************
*** CONTROLLERS ****
*******************/

//refresh controller
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
                const accessToken = createAccessToken({ id: decoded.id });
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

// login controller
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
        const payload = {id: existingUser._id.toString()} as {id: string};
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

// logout controller
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

// register controller
const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({message: "All fields are required."}); // general client error
        }

        const userExists = await User.findOne({email: email}).exec();

        if (userExists) {
            return res.status(409).json({ message: "User already exists" }); // conflict
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        let user = {
            username: username,
            email: email,
            hashedPassword: hashedPassword,
            isVerified: false, 
        }

        let userRecord = new User(user);
        userRecord = await userRecord.save();
        const recordId = userRecord._id;
        const recordIdString = recordId.toString();
        sendMail(email, recordIdString);
        return res.json({ message: "Check email to confirm your account." });
    }
    catch (error) {
        res.send(error);
    }
};

// verify email controller
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