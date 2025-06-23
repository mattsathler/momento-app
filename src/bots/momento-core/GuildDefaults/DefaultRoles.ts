import { RoleCreateOptions } from "discord.js";

export const DefaultsRoles: { [key: string]: RoleCreateOptions } = {
    Leader: {
        name: "Líder",
        color: 0xDD247B,
        mentionable: false,
    },
    User: {
        name: "User",
        color: 0xDD247B,
        mentionable: false,
    }
}