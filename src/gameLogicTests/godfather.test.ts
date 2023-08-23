import { initState } from "./initState";
import updateGame_night from "../gameLogic/updateGame_night";
import { ActionInterface } from "../models/activeGameModel";
import initTest from "./initTest";

const updateFunction = updateGame_night;

let description = "Godfather kills villager";
let curState = initState(undefined);
let curActions : ActionInterface = {"Godfather": {actionVote: "Villager"}};
let libIndex = "0";
let expectedState = initState({"Villager": {isAlive: false}});
let expectedLibEntry = ["Villager, the Villager, was killed by the Mafia."];
let shouldLibUpdate = true;
let shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather tries to kill Bulletprof (with vest)";
curState = initState(undefined);
curActions = {"Godfather": {actionVote: "Bulletproof"}};
libIndex = "0";
expectedState = initState({"Bulletproof": {numActionsLeft: 0}});
expectedLibEntry = ["Bulletproof was almost killed by the Mafia, but was saved by their bulletproof vest!"];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills Bulletprof (without vest)";
curState = initState({"Bulletproof": {numActionsLeft: 0}});
curActions = {"Godfather": {actionVote: "Bulletproof"}};
libIndex = "0";
expectedState = initState({"Bulletproof": {numActionsLeft: 0, isAlive: false}});
expectedLibEntry = ["Bulletproof, the Bulletproof, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills Cop";
curState = initState(undefined);
curActions = {"Godfather": {actionVote: "Cop"}};
libIndex = "0";
expectedState = initState({"Cop": {isAlive: false}});
expectedLibEntry = ["Cop, the Cop, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills Creeper";
curState = initState(undefined);
curActions = {"Godfather": {actionVote: "Creeper"}};
libIndex = "0";
expectedState = initState({"Creeper": {isAlive: false}});
expectedLibEntry = ["Creeper, the Creeper, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills Sniper";
curState = initState(undefined);
curActions = {"Godfather": {actionVote: "Sniper"}};
libIndex = "0";
expectedState = initState({"Sniper": {isAlive: false}});
expectedLibEntry = ["Sniper, the Sniper, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather tries to kill Doctor, but Doctor self heals";
curState = initState(undefined);
curActions = {"Godfather": {actionVote: "Doctor"}, "Doctor": {actionVote: "Doctor"}};
libIndex = "0";
expectedState = initState(undefined);
expectedLibEntry = ["Doctor was almost killed by the Mafia, but was saved by the Doctor!"];
shouldLibUpdate = true;
shouldStateUpdate = false;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills Doctor";
curState = initState(undefined);
curActions = {"Godfather": {actionVote: "Doctor"}, "Doctor": {actionVote: "Villager"}};
libIndex = "0";
expectedState = initState({"Doctor": {isAlive: false}});
expectedLibEntry = ["Doctor, the Doctor, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills gravedigger (reviving Sniper)";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}});
curActions = {"Godfather": {actionVote: "Gravedigger"}, "Gravedigger": {actionVote: "Sniper"}};
libIndex = "0";
expectedState = initState({"Sniper": {isAlive: true, numActionsLeft: 1}, "Gravedigger": {isAlive: false, numActionsLeft: 0}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Mafia.", "Sniper, the Sniper, was revived by Gravedigger, the Gravedigger."]
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Godfather kills gravedigger (not reviving)";
curState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}});
curActions = {"Godfather": {actionVote: "Gravedigger"}};
libIndex = "0";
expectedState = initState({"Sniper": {isAlive: false, numActionsLeft: 0}, "Gravedigger": {isAlive: false, numActionsLeft: 1}});
expectedLibEntry = ["Gravedigger, the Gravedigger, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);