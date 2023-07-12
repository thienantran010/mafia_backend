export type Role = 
| "Villager" 
| "Kamikaze" 
| "Sniper" 
| "Gravedigger" 
| "Bulletproof" 
| "Mafia"
| "Godfather" 
| "Toaster" 
| "Cop" 
| "Creeper" 
| "Doctor";

export const RoleArray : Role[] = [
    "Villager",
    "Kamikaze",
    "Sniper",
    "Gravedigger",
    "Bulletproof",
    "Mafia",
    "Godfather",
    "Toaster",
    "Cop",
    "Creeper",
    "Doctor"
]

type roleNumActions = {
    [role in Role]: number;
}

export const roleNumActions : roleNumActions = {
    "Villager": 0,
    "Kamikaze": 1,
    "Sniper": 1,
    "Gravedigger": 1,
    "Bulletproof": 1,
    "Mafia": Infinity,
    "Godfather": Infinity,
    "Toaster": Infinity,
    "Cop": Infinity,
    "Creeper": Infinity,
    "Doctor": Infinity,
}