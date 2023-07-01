"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const authController_1 = require("../controllers/authController");
;
// configuration
dotenv_1.default.config();
const authRouter = (0, express_1.Router)();
authRouter.use(body_parser_1.default.json());
authRouter.use(body_parser_1.default.urlencoded({ extended: false }));
authRouter.post('/login', authController_1.login);
authRouter.post('/logout', authController_1.logout);
authRouter.post('/register', authController_1.register);
authRouter.post('/refresh', authController_1.refresh);
authRouter.post('/:recordId', authController_1.verifyEmail);
exports.default = authRouter;
