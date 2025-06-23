import { ButtonInteraction, Interaction, ModalSubmitInteraction } from "discord.js";
import { IContext } from "../../Interfaces/IContext";
import { interactionList, submitList } from "../../Commands/CommandLists";
import { IPost } from "../../Interfaces/IPost";
import { Permission } from "../../Interfaces/IPermission";
import { User } from "src/shared/models/User";

export async function interactionCreate(ctx: IContext, interaction: Interaction) {
    if (interaction.member?.user.bot) return
    let customId: string | null = null;
    if (interaction.isModalSubmit()) { customId = interaction.customId }
    if (interaction.isButton()) { customId = interaction.customId }
    if (interaction.isStringSelectMenu()) { customId = interaction.customId }
    if (!customId) { return }

    const author = await ctx.mongoService.getOne('users', {
        userId: interaction.user.id,
        guildId: interaction.guildId
    }) as User || null;

    if (author && author.userId === process.env.OWNER_ID) { author.permission = Permission.ceo }
    try {
        console.log('INTERACTION:', interaction.user.id, (interaction.channelId || 'No channel'), customId)
        if (submitList[customId]) {
            if (submitList[customId].isProfileCommand) {
                if (!author || !author.references.channelId) {
                    throw new Error('Você não pode executar comandos de perfil sem estar registrado!');
                }
                const isComment = await ctx.mongoService.getOne('posts', {
                    'references.messageId': interaction.channelId,
                    'references.guildId': interaction.guildId
                }) as IPost || null;
                if (interaction.channelId !== author.references.channelId
                    && interaction.channelId !== author.references.notificationId
                    && !(isComment && isComment.references.ownerId === author.userId)) {
                    throw new Error('Você não pode executar comandos de perfil em outros canais!');
                }
            }

            if (interaction.isModalSubmit()) {
                try {
                    await submitList[customId].exec(ctx, interaction as ModalSubmitInteraction);
                }
                catch (err: any) {
                    if (interaction.isRepliable() && !interaction.deferred) {
                        try {
                            await interaction.reply({ content: err.message || 'Ocorreu um erro inesperado!', ephemeral: true })
                        }
                        catch {
                            return
                        }
                    }
                }
            }
            return
        }

        if (interactionList[customId]) {
            if (interactionList[customId].isProfileCommand) {
                if (!author || !author.references.channelId) {
                    throw new Error('Você não pode executar comandos de perfil sem estar registrado!');
                }
                const isComment = await ctx.mongoService.getOne('posts', {
                    'references.messageId': interaction.channelId,
                    'references.guildId': interaction.guildId
                }) as IPost || null;
                if (interaction.channelId !== author.references.channelId
                    && interaction.channelId !== author.references.notificationId
                    && !(isComment && isComment.references.ownerId === author.userId)) {
                    throw new Error('Você não pode executar comandos de perfil em outros canais!');
                }
            }

            const execFunc = interactionList[customId].exec.bind(interactionList[customId], ctx, interaction as ButtonInteraction);
            try {
                await execFunc();
            }
            catch (err) {
                console.log(err)
            }
        }
    }
    catch (err: any) {
        if (interaction.isRepliable() && !interaction.deferred) {
            try {
                await interaction.reply({ content: err.message || 'Ocorreu um erro inesperado!', ephemeral: true })
            }
            catch {
                return
            }
        }
    }

    // ctx.interactors = ctx.interactors.filter((id: string) => id !== interaction.user.id);
    return
}