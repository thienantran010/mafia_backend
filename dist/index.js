"use strict";
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
const activeGameRoutes_1 = __importDefault(require("./routes/activeGameRoutes"));
// middleware
const verifyJwt_1 = __importDefault(require("./middleware/verifyJwt"));
// change streams
const openGameChangeStream_1 = __importDefault(require("./changeStreams/openGameChangeStream"));
const activeGameChangeStream_1 = __importDefault(require("./changeStreams/activeGameChangeStream"));
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
// changestream
(0, openGameChangeStream_1.default)(io);
(0, activeGameChangeStream_1.default)(io);
// middleware
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use('/auth', authRoutes_1.default);
app.use(verifyJwt_1.default);
app.use('/', openGameRoutes_1.default);
app.use('/openGames', openGameRoutes_1.default);
app.use('/activeGames', activeGameRoutes_1.default);
