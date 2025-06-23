import { ComponentType, ModalSubmitInteraction } from "discord.js";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { ICommand } from "../../Interfaces/ICommand";

interface IEditableFields {
    likesToTrend: number | null,
    momentosToVerify: number | null,
    followersToVerify: number | null,
    trendsToVerify: number | null,
}

export const editPosts: ICommand = {
    permission: Permission.moderator,
    isProfileCommand: false,
    reply: 'Editando seu analytics',
    success: 'Analytics editado com sucesso!',
    exec: editPostsExec
}

async function editPostsExec(ctx: IContext, interaction: ModalSubmitInteraction) {
    if (!ctx.serverConfig) { throw new Error("Invalid server config!") }

    const serverConfig = ctx.serverConfig;
    const formField = fetchFormFields(interaction);
    if (!formField) { await interaction.reply({ content: 'Nada alterado em seu analytics. =)', ephemeral: true }); return }

    await interaction.reply({ content: "Alterando suas configurações do analytics...", ephemeral: true })
    let newConfig: { analytics: IEditableFields } = {
        analytics: {
            likesToTrend: formField.likesToTrend ?? serverConfig.analytics.likesToTrend,
            momentosToVerify: formField.momentosToVerify ?? serverConfig.analytics.momentosToVerify,
            followersToVerify: formField.followersToVerify ?? serverConfig.analytics.followersToVerify,
            trendsToVerify: formField.trendsToVerify ?? serverConfig.analytics.trendsToVerify,
        }
    }

    try {
        await ctx.mongoService.patch('servers', { id: interaction.guildId }, newConfig);
        await interaction.editReply("Configurações alteradas com sucesso!");
    }
    catch(err: any) {
        await interaction.editReply(err.message)
    }
    return
}

function fetchFormFields(interaction: ModalSubmitInteraction): IEditableFields | null {
    const likesToTrendField = interaction.fields.getField('likesToTrendField', ComponentType.TextInput).value
    const momentosToVerifyField = interaction.fields.getField('momentosToVerifyField', ComponentType.TextInput).value
    const followersToVerifyField = interaction.fields.getField('followersToVerifyField', ComponentType.TextInput).value
    const trendsToVerifyField = interaction.fields.getField('trendsToVerifyField', ComponentType.TextInput).value

    const likesToTrend = likesToTrendField.length > 0 ? Number(likesToTrendField) : null;
    const momentosToVerify = momentosToVerifyField.length > 0 ? Number(momentosToVerifyField) : null;
    const followersToVerify = followersToVerifyField.length > 0 ? Number(followersToVerifyField) : null;
    const trendsToVerify = trendsToVerifyField.length > 0 ? Number(trendsToVerifyField) : null;

    if (!likesToTrend && !momentosToVerify && !trendsToVerify && !followersToVerify) { return null }
    return { likesToTrend, momentosToVerify, trendsToVerify, followersToVerify }
}