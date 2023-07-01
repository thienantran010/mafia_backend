"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY;
const verifyJwt = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.sendStatus(401); //unauthorized (we don't know who they are)
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_KEY);
        if (typeof decoded === "object") {
            req.id = decoded.id;
            next();
        }
    }
    catch (error) {
        return res.sendStatus(403);
    }
};
exports.default = verifyJwt;
