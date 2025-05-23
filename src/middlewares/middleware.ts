import { Message } from "discord.js";

type MiddlewareResult = true | { error: string; code: number };

export type Middleware = (message: Message) => MiddlewareResult;
