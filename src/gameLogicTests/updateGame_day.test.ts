import { initState } from "./initState";
import { initDayVotes } from "./initDayVotes";
import initTest from "./initTest";
import updateGame_day from "../gameLogic/updateGame_day";
import _ from 'lodash';

const updateFunction = updateGame_day;

let description = "No votes, no one voted off";
let curState = initState(undefined);
let alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
let curActions = initDayVotes(alivePlayers, "none", []);
let libIndex = "1";
let expectedState = initState(undefined);
let expectedLibEntry : string[] = [];
let shouldLibUpdate = false;
let shouldStateUpdate = false;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "everyone votes, but 'Mafia' is voted off";
curState = initState(undefined);
alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
curActions = initDayVotes(alivePlayers, "landslide", ["Mafia"]);
libIndex = "1";
expectedState = initState({"Mafia": {isAlive: false}});
expectedLibEntry = ["Mafia, the Mafia, was executed by the Village."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

// special case to test 5050
description = "10/11 votes, but 50/50 between Mafia and Villager";
alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
curActions = initDayVotes(alivePlayers, "random", ["Mafia", "Villager"]);
libIndex = "1";
const deadMafiaState = initState({"Cop": {isAlive: false}, "Mafia": {isAlive: false}});
const deadVillagerState = initState({"Cop": {isAlive: false}, "Villager": {isAlive: false}});
const deadMafiaLibEntry = ["Mafia, the Mafia, was executed by the Village."];
const deadVillagerLibEntry = ["Villager, the Villager, was executed by the Village."];
shouldLibUpdate = true;
shouldStateUpdate = true;
const didUpdateLibraryArr : boolean [] = [];
const didUpdateStateArr : boolean [] = [];
let deadMafiaTrials = 0;
let deadVillagerTrials = 0;
for (let i = 0; i < 10; i++) {
    curState = initState({"Cop": {isAlive: false}});
    const { updatedState, newLibEntry, didUpdateLibrary, didUpdateState } = updateGame_day(curState, curActions, libIndex);
    didUpdateLibraryArr.push(didUpdateLibrary);
    didUpdateStateArr.push(didUpdateState);
    if (_.isEqual(deadMafiaState, updatedState) && _.isEqual(deadMafiaLibEntry, newLibEntry)) {
        deadMafiaTrials += 1;
    }
    else if (!_.isEqual(deadMafiaState, updatedState) && _.isEqual(deadMafiaLibEntry, newLibEntry)) {
        console.log(deadMafiaState);
        console.log(updatedState)
        throw new Error("incorrect mafia state")
    }
    else if (_.isEqual(deadVillagerState, updatedState) && _.isEqual(deadVillagerLibEntry, newLibEntry)) {
        deadVillagerTrials += 1;
    }
    else if (!_.isEqual(deadVillagerState, updatedState) && _.isEqual(deadVillagerLibEntry, newLibEntry)) {
        console.log(deadVillagerState);
        console.log(updatedState)
        throw new Error("incorrect villager state")
    }
    else {
        throw new Error("wrong")
    }
}

test(description, () => {
    expect(deadMafiaTrials > 0).toBe(true);
    expect(deadVillagerTrials > 0).toBe(true);
    expect(didUpdateLibraryArr.every((bool : boolean) => bool)).toBe(true);
    expect(didUpdateStateArr.every((bool) => bool)).toBe(true);
});

description = "Kamikaze blows up Bulletproof and Bulletproof is executed";
curState = initState(undefined);
alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
curActions = initDayVotes(alivePlayers, "landslide", ["Bulletproof"]);
curActions["Kamikaze"] = {...curActions["Kamikaze"], actionVote: "Bulletproof"}
libIndex = "1";
expectedState = initState({"Kamikaze": {numActionsLeft: 0, isAlive: false}, "Bulletproof": {numActionsLeft: 0, isAlive: false}});
expectedLibEntry = ["Bulletproof was almost killed by Kamikaze, the Kamikaze, but was saved by their bulletproof vest!", "Bulletproof, the Bulletproof, was executed by the Village."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);

description = "Kamikaze blows up Villager and Bulletproof is executed";
curState = initState(undefined);
alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
curActions = initDayVotes(alivePlayers, "landslide", ["Bulletproof"]);
curActions["Kamikaze"] = {...curActions["Kamikaze"], actionVote: "Villager"}
libIndex = "1";
expectedState = initState({"Kamikaze": {numActionsLeft: 0, isAlive: false}, "Villager": {isAlive: false}, "Bulletproof": {isAlive: false}});
expectedLibEntry = ["Villager, the Villager, was blown up by Kamikaze, the Kamikaze.", "Bulletproof, the Bulletproof, was executed by the Village."];
shouldLibUpdate = true;
shouldStateUpdate = true;
initTest(description, updateFunction, curState, curActions, libIndex, expectedState, expectedLibEntry, shouldLibUpdate, shouldStateUpdate);