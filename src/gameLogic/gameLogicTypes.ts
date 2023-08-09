import { Role } from "../rolesConfig";

export interface Counter {
    [username : string] : number;
}

export interface event {
    user: {
        username: string;
        role: Role;
    },

    target: {
        username: string;
        role: Role;
    }
}

export interface RunningState {
    [username: string]: {
        toastedBy: string[];
        healedBy: string[];
        attackedBy: string[];
        checkedBy: string[];
        snipedBy: string[];
        copTarget: string;
        creeperTarget: string;
        gravediggerTarget: string;
    }
}

export interface RunningDayState {
    [username: string]: {
        blownBy: string[];
    }
}