import { IContext } from "./IContext"
import { Permission } from "./IPermission"

export interface ICommand {
    reply?: string
    success?: string
    error?: string
    permission: Permission
    controller?: any
    deleteMessage?: boolean,
    deleteReply?: boolean,
    isProfileCommand: boolean,
    exec: (ctx: IContext, ...args: any) => Promise<void> 
}