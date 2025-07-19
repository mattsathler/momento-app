import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Message } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { MomentoService } from "./momento-service"
import { IServer } from "../../../Interfaces/IServer"

export const momento: ICommand = {
    reply: 'Configurando o momento',
    permission: Permission.moderator,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        if (!message.guild) throw new Error('Não foi possível encontrar o servidor.')

        const isConfigured = await ctx.mongoService.getOne('servers', { id: message.guild.id }) as IServer;
        if (isConfigured) {
            const openConfigurePostsModalButton = new ButtonBuilder()
                .setCustomId('openConfigurePostsModal')
                .setLabel('Configurar Posts')
                .setStyle(ButtonStyle.Secondary)

            const openConfigureTrendsWebhooksModal = new ButtonBuilder()
                .setCustomId('openConfigureTrendsWebhooksModal')
                .setLabel('Configurar Webhooks de Trend')
                .setStyle(ButtonStyle.Secondary)

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(openConfigureTrendsWebhooksModal, openConfigurePostsModalButton)

            try {
                const reply = await message.reply({
                    content: 'Painel de configuração',
                    components: [actionRow],
                })
            }
            catch(err) { console.log(err) }
            return;
        };

        await configureServer(ctx, message);
    }
}

async function configureServer(ctx: IContext, message: Message) {
    if (!message.guild) throw new Error('Não foi possível encontrar o servidor.')

    const trendsChannel = await message.guild.channels.create({
        name: 'trends',
        type: ChannelType.GuildText,
        permissionOverwrites: [{
            id: message.guild.roles.everyone.id,
            deny: ['SendMessages', 'AttachFiles'],
        }],
    });

    const trendingWebhook = await trendsChannel.createWebhook({
        name: "MOMENTO TRENDING",
        avatar: "https://imgur.com/eRYLRQ4.png",
    })


    const serverConfig: IServer = {
        id: message.guild.id,
        analytics: {
            likesToTrend: 10,
            momentosTimeout: 10,
            followersMultiplier: 1,
        },
        emojisId: {
            like: '👍',
            comment: '💬',
            share: '📤',
            report: '🚩',
        },
        trendWebhooks: [
            trendingWebhook.url
        ],
    };

    await ctx.mongoService.post('servers', serverConfig);
}