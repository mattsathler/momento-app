import { ButtonInteraction, Guild, Message, MessageReaction, User } from "discord.js";
import { IContext } from "../Interfaces/IContext";
import { reactionAdd } from "../Events/ReactionAdd/ReactionAdd";
import { interactionCreate } from "../Events/InteractionCreate/InteractionCreate";
import { tryDeleteMessage } from "../Utils/Messages";
import { IServer } from "../Interfaces/IServer";
import { NotificationService } from "../../../shared/services/NotificationService";
import { reactionRemove } from "../Events/ReactionRemove/ReactionRemove";
import { messageCreate } from "../Events/MessageCreate/MessageCreate";

export class EventHandler {
    [key: string]: any
    public async messageCreate(ctx: IContext, message: Message) {
        if (!message.guildId) { return }
        if (message.author.bot) { return }

        const serverConfig = await ctx.mongoService.getOne('servers', {
            id: message.guildId
        }) as IServer || null;
        const notificationService: NotificationService = new NotificationService(ctx);
        ctx.notificationService = notificationService;
        ctx.serverConfig = serverConfig;

        try {
            await messageCreate(ctx, message)
        }
        catch (error: any) {
            try {

                const replyMessage = await message.reply(error.message);
                setTimeout(() => {
                    tryDeleteMessage(message);
                    tryDeleteMessage(replyMessage);
                }, 4000);
            }
            catch (error) {
                console.log(error)
            }
        }
    }

    public async messageReactionAdd(ctx: IContext, message: MessageReaction, user: User) {
        const serverConfig = await ctx.mongoService.getOne('servers', {
            id: message.message.guildId
        }) as IServer || null;
        const notificationService: NotificationService = new NotificationService(ctx);
        ctx.notificationService = notificationService;
        if (!serverConfig) { return };
        ctx.serverConfig = serverConfig;
        await reactionAdd(ctx, message, user)
    }

    public async messageReactionRemove(ctx: IContext, message: MessageReaction, user: User) {
        const serverConfig = await ctx.mongoService.getOne('servers', {
            id: message.message.guildId
        }) as IServer || null;
        const notificationService: NotificationService = new NotificationService(ctx);
        ctx.notificationService = notificationService;
        if (!serverConfig) { return };
        ctx.serverConfig = serverConfig;
        await reactionRemove(ctx, message, user)
    }

    public async interactionCreate(ctx: IContext, interaction: ButtonInteraction) {
        const serverConfig = await ctx.mongoService.getOne('servers', {
            id: interaction.guildId
        }) as IServer || null;
        const notificationService: NotificationService = new NotificationService(ctx);
        ctx.notificationService = notificationService;
        ctx.serverConfig = serverConfig;
        await interactionCreate(ctx, interaction);
    }
}