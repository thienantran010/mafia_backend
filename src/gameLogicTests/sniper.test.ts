import { initState } from "./initState";
import updateGame_night from "../gameLogic/updateGame_night";
import { ActionInterface } from "../models/activeGameModel";
import initTest from "./initTest";

const updateFunction = updateGame_night;

let description = "Sniper snipes Villager";
let curState = initState(undefined);
let curActions : ActionInterface = {"Sniper": {actionVote: "Villager"}};
let libIndex = "0";
let expectedState = initState({"Villager": {isAlive: false}, "Sniper": {numActionsLeft: 0}});
let expectedLibEntry = ["Villager, the Villager, was killed by the Sniper."];
let shouldLibUpdate = true;
let shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Sniper snipes Bulletproof";
curState = initState(undefined);
curActions = {"Sniper": {actionVote: "Bulletproof"}};
libIndex = "0";
expectedState = initState({"Sniper": {numActionsLeft: 0}, "Bulletproof": {numActionsLeft: 0}});
expectedLibEntry = ["Bulletproof was almost killed by the Sniper, but was saved by their bulletproof vest!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Sniper snipes Cop";
curState = initState(undefined);
curActions = {"Sniper": {actionVote: "Cop"}};
libIndex = "0";
expectedState = initState({"Sniper": {numActionsLeft: 0}, "Cop": {isAlive: false}});
expectedLibEntry = ["Cop, the Cop, was killed by the Sniper."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Sniper snipes Doctor who heals themself";
curState = initState(undefined);
curActions = {"Sniper": {actionVote: "Doctor"}, "Doctor": {actionVote: "Doctor"}};
libIndex = "0";
expectedState = initState({"Sniper": {numActionsLeft: 0}, "Doctor": {isAlive: true}});
expectedLibEntry = ["Doctor was almost killed by the Sniper, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = false;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Sniper snipes Gravedigger who revives Villager";
curState = initState({"Villager": {isAlive: false}});
curActions = {"Sniper": {actionVote: "Gravedigger"}, "Gravedigger": {actionVote: "Villager"}};
libIndex = "0";
expectedState = initState({"Sniper": {numActionsLeft: 0}, "Gravedigger": {numActionsLeft: 0, isAlive: false}, "Villager": {isAlive: true}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Sniper.", "Villager, the Villager, was revived by Gravedigger, the Gravedigger."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);