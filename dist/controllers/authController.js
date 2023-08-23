"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.verifyEmail = exports.register = exports.logout = exports.login = void 0;
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// configuration
dotenv_1.default.config();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
mail_1.default.setApiKey(SENDGRID_API_KEY);
const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY;
/*******************
* HELPER FUNCTIONS *
*******************/
// to send mail
const sendMail = (email, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.MY_EMAIL) {
        const msg = {
            to: email,
            from: process.env.MY_EMAIL,
            subject: 'Verify your Mafia account',
            html: `Click <a href="${process.env.FRONTEND_URL}/verify/${verificationCode}"> here </a> to verify your account!`,
        };
        yield mail_1.default.send(msg);
        console.log('Email sent');
    }
    else {
        console.log("provide a email to send from");
    }
});
// create access token
const createAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(Object.assign({}, payload), ACCESS_TOKEN_KEY, {
        expiresIn: 3 * 24 * 60 * 60,
    });
};
// create refresh token
const createRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(Object.assign({}, payload), REFRESH_TOKEN_KEY, {
        expiresIn: 3 * 24 * 60 * 60,
    });
};
// handle refreshing access token
// if cookie exists, decode the refresh token stored in the cookie
// use the information stored in refresh token to create and send back access token
const refresh = (req, res) => {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.refreshToken))
        return res.status(401).json({ message: 'Unauthorized' });
    const refreshToken = cookies.refreshToken;
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_KEY);
        if (typeof decoded === "object") {
            const handleRefresh = (decoded) => __awaiter(void 0, void 0, void 0, function* () {
                const userExists = yield userModel_1.User.findById(decoded.id).exec();
                if (!userExists)
                    return res.status(401).json({ message: 'Unauthorized' });
                const accessToken = createAccessToken({ id: decoded.id, username: decoded.username });
                const username = userExists.username;
                return { accessToken, username };
            });
            handleRefresh(decoded).then((data) => {
                return res.json(data);
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({ message: 'Forbidden ' });
    }
};
exports.refresh = refresh;
// handle login
// compares user-entered password to hashed password
// if they match, send back access token and refresh token
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' }); // general client error
    }
    try {
        const existingUser = yield userModel_1.User.findOne({ email: email });
        if (!existingUser) {
            return res.status(400).json({ message: "Email or password is wrong" }); // general client error
        }
        const auth = yield bcrypt_1.default.compare(password, existingUser.hashedPassword);
        if (!auth) {
            return res.status(400).json({ message: "Email or password is wrong" }); // general client error
        }
        const username = existingUser.username;
        const payload = { id: existingUser._id.toString(), username: existingUser.username };
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
});
exports.login = login;
// handles logout
// clears all cookies
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.refreshToken))
        return res.status(204).json({ message: "No refresh token to clear" });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });
    res.json({ message: 'Logged out' });
});
exports.logout = logout;
// handles registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // if user didn't enter all fields, error
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." }); // general client error
        }
        const userExists = yield userModel_1.User.findOne({ email: email }).exec();
        // if user already exists, error
        if (userExists) {
            return res.status(409).json({ message: "User already exists" }); // conflict
        }
        // else create hashed password
        const hashedPassword = yield bcrypt_1.default.hash(password, 12);
        let user = {
            username: username,
            email: email,
            hashedPassword: hashedPassword,
            isVerified: false,
        };
        // save new user
        let userRecord = new userModel_1.User(user);
        userRecord = yield userRecord.save();
        const recordId = userRecord._id;
        const recordIdString = recordId.toString();
        // send email to verify user email address. they are sent a unique confirmation link
        sendMail(email, recordIdString);
        return res.json({ message: "Check email to confirm your account." });
    }
    catch (error) {
        res.send(error);
    }
});
exports.register = register;
// handles verification
// link sent in confirmation will call this function
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recordId } = req.params;
        const existingUser = yield userModel_1.User.findById(recordId).exec();
        if (existingUser) {
            if (existingUser.isVerified === false) {
                existingUser.isVerified = true;
                yield existingUser.save();
                return res.json({ message: 'Your account has been verified! Please return to login page.' });
            }
            return res.json({ message: 'Your account has already been verified. Please return to the login page.' });
        }
        else {
            return res.status(404).json({ message: 'this verification code is not tied to any user' }); //not found
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.verifyEmail = verifyEmail;
