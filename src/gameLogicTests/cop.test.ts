import { initState } from "./initState";
import updateGame_night from "../gameLogic/updateGame_night";
import { ActionInterface } from "../models/activeGameModel";
import initTest from "./initTest";

const updateFunction = updateGame_night;

let description = "Cop checks Villager";
let curState = initState(undefined);
let curActions : ActionInterface = {"Cop": {actionVote: "Villager"}};
let libIndex = "0";
let expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Villager is sided with the Village."]}}});
let expectedLibEntry : string[] = [];
let shouldLibUpdate = false;
let shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Bulletproof";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Bulletproof"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Bulletproof is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks self";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Cop"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Cop is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Creeper";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Creeper"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Creeper is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Doctor";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Doctor"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Doctor is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Sniper";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Sniper"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Sniper is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Gravedigger";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Gravedigger"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Gravedigger is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Godfather";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Godfather"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Godfather is sided with the Village."]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Mafia";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Mafia"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Mafia is sided with the Mafia!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Kamikaze";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Kamikaze"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Kamikaze is sided with the Mafia!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Cop checks Toaster";
curState = initState(undefined);
curActions = {"Cop": {actionVote: "Toaster"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Toaster is sided with the Mafia!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);