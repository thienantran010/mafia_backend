"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const body_parser_1 = __importDefault(require("body-parser"));
const openGameController_1 = require("../controllers/openGameController");
const openGameRouter = (0, express_1.Router)();
openGameRouter.use(body_parser_1.default.json());
openGameRouter.use(body_parser_1.default.urlencoded({ extended: false }));
openGameRouter.post('/createOpenGame', openGameController_1.createOpenGame);
openGameRouter.get('/getAllOpenGames', openGameController_1.getAllOpenGames);
// openGameRouter.delete('/deleteOpenGame', deleteOpenGame);
openGameRouter.post('/addPlayerToGame', openGameController_1.addPlayerToGame);
openGameRouter.post('/removePlayerFromGame', openGameController_1.removePlayerFromGame);
exports.default = openGameRouter;
