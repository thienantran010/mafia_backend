import updateGame_day from "./updateGame_day";
import { ActiveGameInterface, PlayerInterface, ActionInterface, PlayerEvents} from "../models/activeGameModel";
import { Role } from "../rolesConfig";

import mongoose from "mongoose";

interface initStateArgs {
    [username : string] : {
        playerId?: mongoose.Types.ObjectId;
        isAlive?: boolean;
        toastedBy?: string[];
        role?: Role;
        numActionsLeft?: number;
        events?: PlayerEvents;
    }
}

const initState = (players : initStateArgs | undefined) => {
    const defaultGameState : PlayerInterface = {
        'Mafia': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Mafia",
            numActionsLeft: Infinity,
            events: {}
        },
        'Godfather': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Godfather",
            numActionsLeft: Infinity,
            events: {}
        },
        'Kamikaze': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Kamikaze",
            numActionsLeft: 1,
            events: {}
        },
        'Toaster': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Toaster",
            numActionsLeft: Infinity,
            events: {}
        },
        'Cop': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Cop",
            numActionsLeft: Infinity,
            events: {}
        },
        'Creeper': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Creeper",
            numActionsLeft: Infinity,
            events: {}
        },
        'Villager': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Villager",
            numActionsLeft: 0,
            events: {}
        },
        'Bulletproof': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Bulletproof",
            numActionsLeft: 1,
            events: {}
        },
        'Doctor': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Doctor",
            numActionsLeft: Infinity,
            events: {}
        },
        'Sniper': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Sniper",
            numActionsLeft: 1,
            events: {}
        },
        'Gravedigger': {
            playerId: new mongoose.Types.ObjectId(),
            isAlive: true,
            toastedBy: [],
            role: "Gravedigger",
            numActionsLeft: 1,
            events: {}
        }
    }

    if (players) {
        for (const username in players) {
            defaultGameState[username] = {...defaultGameState[username], ...players[username]}
        }
    }

    return defaultGameState;
}

type VotesState = "none" | "random" | "landslide"
const initDayVotes = (players : string[], state : VotesState, toExecute: string[]) => {
    const actions : ActionInterface = {}

    if(state === "random") {
        const numChunks = toExecute.length;

        if (numChunks === 0) {
            throw new Error("Missing person to execute");
        }

        else if (players.length % numChunks != 0) {
            throw new Error("Not enough votes for a complete random")
        }

        else {
            const chunkSize = players.length / numChunks;
            for (const [index, username] of toExecute.entries()) {
                const start = index * chunkSize;
                const end = start + chunkSize;
                const voters = players.slice(start, end);
                for (const voter of voters) {
                    actions[voter] = {
                        dayVote: username
                    }
                }
            }
        }
    }

    else if (state === "landslide") {
        if (toExecute.length === 0) {
            throw new Error("Missing person to execute");
        }

        else {
            for (const username of players) {
                actions[username] = {
                    dayVote: toExecute[0]
                }
            }
        }
    }

    return actions;
}

test('no votes, no one voted off', () => {
    const libraryIndex = "0";
    const curState = initState(undefined);
    const alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
    const curActions = initDayVotes(alivePlayers, "none", []);
    const { newState, newLibEntry, didUpdateLibrary, didUpdateState} = updateGame_day(curState, curActions, libraryIndex);
    expect(newState).toEqual(curState);
    expect(newLibEntry).toHaveLength(0);
    expect(didUpdateLibrary).toBe(false);
    expect(didUpdateState).toBe(false);
});

test("everyone votes, 'Mafia' is voted off", () => {
    const libraryIndex = "0";
    const curState = initState(undefined);
    const alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
    const curActions = initDayVotes(alivePlayers, "landslide", ["Mafia"]);
    const { newState, newLibEntry, didUpdateLibrary, didUpdateState } = updateGame_day(curState, curActions, libraryIndex);
    expect(newState).toEqual({...curState, "Mafia": {...curState["Mafia"], isAlive: false}});
    expect(newLibEntry).toEqual(["Mafia, the Mafia, was executed by the village."]);
    expect(didUpdateLibrary).toBe(true);
    expect(didUpdateState).toBe(true);

});

test("10/11 votes, 50/50", () => {
    const libraryIndex = "0";
    const curState = initState({"Cop": {isAlive: false}});
    const alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
    const curActions = initDayVotes(alivePlayers, "random", ["Mafia", "Villager"]);
    const deathCounter = {"Mafia": 0, "Villager": 0};
    for (let i = 0; i < 10; i++) {

        // for some reason this test doesn't work if curState isn't instantiated per trial
        const curState = initState({"Cop": {isAlive: false}});
        const { newState, newLibEntry, didUpdateLibrary, didUpdateState } = updateGame_day(curState, curActions, libraryIndex);
        if (!newState["Mafia"].isAlive && newState["Villager"].isAlive) {
            deathCounter["Mafia"] += 1;
        }
        else if (newState["Mafia"].isAlive && !newState["Villager"].isAlive) {
            deathCounter["Villager"] += 1;
        }
        else if (newState["Mafia"].isAlive && newState["Villager"].isAlive){
            throw new Error("No one died");
        }
        else {
            throw new Error("Both died");
        }
    }

    expect(deathCounter["Mafia"] > 0 && deathCounter["Villager"] > 0).toBe(true);
});

test("kamikaze blows up villager and bulletproof is executed", () => {
    const libraryIndex = "0";
    const curState = initState(undefined);
    const alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
    const curActions = initDayVotes(alivePlayers, "landslide", ["Bulletproof"]);
    curActions["Kamikaze"].actionVote = "Villager";
    const { newState, newLibEntry, didUpdateLibrary, didUpdateState } = updateGame_day(curState, curActions, libraryIndex);
    expect(newState).toEqual({
        ...curState, 
        "Kamikaze": {...curState["Kamikaze"], isAlive: false, numActionsLeft: 0}, 
        "Bulletproof": {...curState["Bulletproof"], isAlive: false},
        "Villager": {...curState["Villager"], isAlive: false}
    });
    expect(newLibEntry).toEqual(["Villager, the Villager, was blown up by Kamikaze, the Kamikaze.", "Bulletproof, the Bulletproof, was executed by the village."]);
    expect(didUpdateLibrary).toBe(true);
    expect(didUpdateState).toBe(true);

});

test("kamikaze blows up bp while bp is executed", () => {
    const libraryIndex = "0";
    const curState = initState(undefined);
    const alivePlayers = Object.keys(curState).filter((username) => curState[username].isAlive);
    const curActions = initDayVotes(alivePlayers, "landslide", ["Bulletproof"]);
    curActions["Kamikaze"].actionVote = "Bulletproof";
    const { newState, newLibEntry, didUpdateLibrary, didUpdateState } = updateGame_day(curState, curActions, libraryIndex);
    expect(newState).toEqual({
        ...curState, 
        "Kamikaze": {...curState["Kamikaze"], isAlive: false, numActionsLeft: 0}, 
        "Bulletproof": {...curState["Bulletproof"], numActionsLeft: 0, isAlive: false},
    });
    expect(newLibEntry).toEqual(["Bulletproof, the Bulletproof, was almost killed by Kamikaze, the Kamikaze, but was saved by their bulletproof vest!", "Bulletproof, the Bulletproof, was executed by the village."]);
    expect(didUpdateLibrary).toBe(true);
    expect(didUpdateState).toBe(true);
});
