// libraries
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

// routes
import authRouter from "./routes/authRoutes";
import openGameRouter from './routes/openGameRoutes';
import activeGameRouter from './routes/activeGameRoutes';

// models
import { OpenGame } from './models/openGameModel';
import { ActiveGame } from './models/activeGameModel';
import { User } from './models/userModel';

// middleware
import verifyJwt from "./middleware/verifyJwt";

// types
import { ChangeStreamDeleteDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument} from 'mongodb';
import { OpenGameInterface, openGameJson, playerJson } from './models/openGameModel';
import { ActiveGameInterface } from './models/activeGameModel';
import { UserInterface } from './models/userModel';

// change streams
import openGameChangeStream from "./changeStreams/openGameChangeStream";
import activeGameChangeStream from "./changeStreams/activeGameChangeStream";

// configuration
dotenv.config();
const app = express();
const port = process.env.PORT;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
}

// connecting to database
mongoose.set("strictQuery", false);
const connectionString = process.env.MONGODB_CONNECTION as string;
mongoose.connect(connectionString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
})
database.once('connected', () => {
    console.log('Connected to MongoDB database');
})

// socket.io stuff
const httpServer = createServer(app);
const io = new Server(httpServer, {
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
openGameChangeStream(io);
activeGameChangeStream(io);

// middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/auth', authRouter);
app.use(verifyJwt);
app.use('/', openGameRouter);
app.use('/openGames', openGameRouter);
app.use('/activeGames', activeGameRouter);