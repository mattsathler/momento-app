import { Client, TextChannel } from "discord.js"
import { MongoService } from "../Services/MongoService"
import { LinkService } from "../Utils/LinkService"
import { IServer } from "./IServer"
import { NotificationService } from "../../../shared/services/NotificationService"
import { IPost } from "./IPost"

export interface IContext {
    client: Client
    uploadChannel: TextChannel
    mongoService: MongoService
    linkService: LinkService
    serverConfig?: IServer,
    notificationService?: NotificationService,
    interactors: string[],
    activePostList: IPost[]
}