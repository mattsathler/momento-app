import { Client, TextChannel } from "discord.js"
import { IServer } from "./IServer"
import { NotificationService } from "../../../shared/services/NotificationService"
import { IPost } from "./IPost"
import { MongoService } from "src/shared/services/MongoService"
import { LinkService } from "src/shared/services/LinkService"

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