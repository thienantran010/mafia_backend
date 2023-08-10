import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction} from 'express';
import { JwtPayload } from 'jsonwebtoken';

dotenv.config()

const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY as string;
const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401); //unauthorized (we don't know who they are)
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_KEY);
        if (typeof decoded === "object") {
            req.id = decoded.id;
            req.username = decoded.username;
            next();
        }
    }
    catch (error) {
        return res.sendStatus(403);
    }
}

export default verifyJwt;