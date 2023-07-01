import { Router } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { login, logout, register, refresh, verifyEmail } from '../controllers/authController';;

// configuration
dotenv.config();
const authRouter = Router();
authRouter.use(bodyParser.json());
authRouter.use(bodyParser.urlencoded({extended: false}));

authRouter.post('/login', login);

authRouter.post('/logout', logout);

authRouter.post('/register', register);

authRouter.post('/refresh', refresh);

authRouter.post('/:recordId', verifyEmail);

export default authRouter;