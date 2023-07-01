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
// libraries
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const openGameRoutes_1 = __importDefault(require("./routes/openGameRoutes"));
// models
const openGameModel_1 = require("./models/openGameModel");
const userModel_1 = require("./models/userModel");
// middleware
const verifyJwt_1 = __importDefault(require("./middleware/verifyJwt"));
// configuration
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true
};
// connecting to database
mongoose_1.default.set("strictQuery", false);
const connectionString = process.env.MONGODB_CONNECTION;
mongoose_1.default.connect(connectionString);
const database = mongoose_1.default.connection;
database.on('error', (error) => {
    console.log(error);
});
database.once('connected', () => {
    console.log('Connected to MongoDB database');
});
// socket.io stuff
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        // transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
// change streams
const openGameChangeStream = openGameModel_1.OpenGame.watch();
openGameChangeStream.on("change", (data) => {
    // helper function to produce array of {_id: ObjectId, username: string}
    function findAllUsernames(playerIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const playerObjs = yield Promise.all(playerIds.map((playerId) => __awaiter(this, void 0, void 0, function* () {
                const playerObj = yield userModel_1.User.findById(playerId, 'username').exec();
                return playerObj;
            })));
            return playerObjs;
        });
    }
    switch (data.operationType) {
        case 'insert':
            const playerIds = data.fullDocument.players;
            findAllUsernames(playerIds).then((playerObjs) => {
                const gameObj = Object.assign(Object.assign({}, data.fullDocument), { players: playerObjs });
                io.emit("openGame:create", gameObj);
            });
            break;
        case 'delete':
            io.emit("openGame:delete", data.documentKey._id);
            break;
        // only update possible is players joining/leaving the game
        case 'update':
            console.log('updating game');
            const gameId = data.documentKey._id;
            if (!data.updateDescription.updatedFields) {
                break;
            }
            const numPlayersJoined = data.updateDescription.updatedFields.numPlayersJoined;
            let players = data.updateDescription.updatedFields.players;
            // if a player joins the game, data.players doesn't exist
            // however, players.1 where the number is the index of the players array does exist
            // and contains the player id
            if (players !== undefined) {
                console.log(players);
                findAllUsernames(players).then((playerObjs) => {
                    io.emit("openGame:update:leave", gameId, numPlayersJoined, playerObjs);
                });
                break;
            }
            else {
                console.log(data);
                try {
                    const playerIds = Object.values(data.updateDescription.updatedFields).filter((value) => {
                        return value instanceof mongoose_1.default.Types.ObjectId;
                    });
                    if (playerIds.length > 0) {
                        findAllUsernames(playerIds).then((playerObjs) => {
                            io.emit("openGame:update:join", gameId, numPlayersJoined, playerObjs);
                        });
                    }
                }
                catch (error) {
                    console.log("error");
                }
                break;
            }
    }
});
// middleware
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use('/auth', authRoutes_1.default);
app.use(verifyJwt_1.default);
app.use('/', openGameRoutes_1.default);
app.use('/openGames', openGameRoutes_1.default);
