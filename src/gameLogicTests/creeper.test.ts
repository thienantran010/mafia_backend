import { initState } from "./initState";
import updateGame_night from "../gameLogic/updateGame_night";
import { ActionInterface } from "../models/activeGameModel";
import initTest from "./initTest";

const updateFunction = updateGame_night;

// order is toasters, doctors, mafias, cops
const shuffleCreepVisits = false;

let description = "Creeper creeps self and sees nothing";
let curState = initState(undefined);
let curActions : ActionInterface = {"Creeper": {actionVote: "Creeper"}};
let libIndex = "0";
let expectedState = initState({"Creeper": {events: {"0": ["You crept Creeper and saw nothing."]}}});
let expectedLibEntry : string[] = [];
let shouldLibUpdate = false;
let shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps self and sees Mafia kill them";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Creeper"}, "Mafia": {actionVote: "Creeper"}};
libIndex = "0";
expectedState = initState({"Creeper": {isAlive: false, events: {"0": ["You crept Creeper and saw Mafia visit them!"]}}});
expectedLibEntry = ["Creeper, the Creeper, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps Cop and sees Toaster visit Cop";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Cop"}, "Toaster": {actionVote: "Cop"}};
libIndex = "0";
expectedState = initState({"Cop": {toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, "Creeper": {events: {"0": ["You crept Cop and saw Toaster visit them!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps Toaster and sees Cop visit Toaster";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Toaster"}, "Cop": {actionVote: "Toaster"}};
libIndex = "0";
expectedState = initState({"Cop": {events: {"0": ["Your investigation revealed that Toaster is sided with the Mafia!"]}}, "Creeper": {events: {"0": ["You crept Toaster and saw Cop visit them!"]}}});
expectedLibEntry = [];
shouldLibUpdate = false;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps Doctor and sees Mafia kill them";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Doctor"}, "Mafia": {actionVote: "Doctor"}};
libIndex = "0";
expectedState = initState({"Doctor": {isAlive: false}, "Creeper": {events: {"0": ["You crept Doctor and saw Mafia visit them!"]}}});
expectedLibEntry = ["Doctor, the Doctor, was killed by the Mafia."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps Doctor. Mafia tries to kill Doctor, but Doctor self heals";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Doctor"}, "Mafia": {actionVote: "Doctor"}, "Doctor": {actionVote: "Doctor"}};
libIndex = "0";
expectedState = initState({"Creeper": {events: {"0": ["You crept Doctor and saw Doctor visit them!", "You crept Doctor and saw Mafia visit them!"]}}});
expectedLibEntry = ["Doctor was almost killed by the Mafia, but was saved by the Doctor!"]
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps Doctor. Mafia, Toaster, Doctor, and Cop visit Doctor.";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Doctor"}, "Mafia": {actionVote: "Doctor"}, "Doctor": {actionVote: "Doctor"}, "Toaster": {actionVote: "Doctor"}, "Cop": {actionVote: "Doctor"}};
libIndex = "0";
expectedState = initState({"Doctor": {isAlive: false, toastedBy: ["Toaster"], events: {"0": ["Buttered toast was left on your doorstep. You were roleblocked!"]}}, 
                            "Cop": {events: {"0": ["Your investigation revealed that Doctor is sided with the Village."]}}, 
                            "Creeper": {events: {"0": ["You crept Doctor and saw Toaster visit them!", "You crept Doctor and saw Mafia visit them!", "You crept Doctor and saw Cop visit them!"]}}});
expectedLibEntry = ["Doctor, the Doctor, was killed by the Mafia."]
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);

description = "Creeper creeps Villager. Villager is sniped. Creeper sees nothing.";
curState = initState(undefined);
curActions = {"Creeper": {actionVote: "Villager"}, "Sniper": {actionVote: "Villager"}};
libIndex = "0";
expectedState = initState({"Sniper": {numActionsLeft: 0},
                            "Villager": {isAlive: false},
                            "Creeper": {events: {"0": ["You crept Villager and saw nothing."]}}});
expectedLibEntry = ["Villager, the Villager, was killed by the Sniper."]
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate, shuffleCreepVisits);
