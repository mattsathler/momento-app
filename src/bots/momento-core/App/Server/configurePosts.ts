import { ComponentType, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { ICommand } from "../../Interfaces/ICommand";

interface IEditableFields {
    likesToTrend: number | null
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
    if (!formField) { await interaction.reply({ content: 'Nada alterado em seu analytics. =)', flags: MessageFlags.Ephemeral }); return }

    await interaction.reply({ content: "Alterando suas configurações do analytics...", flags: MessageFlags.Ephemeral })
    let newConfig: { analytics: IEditableFields } = {
        analytics: {
            likesToTrend: formField.likesToTrend ?? serverConfig.analytics.likesToTrend,
        }
    }

    try {
        await ctx.mongoService.patch('servers', { id: interaction.guildId }, newConfig);
        await interaction.editReply("Configurações alteradas com sucesso!");
    }
    catch (err: any) {
        await interaction.editReply(err.message)
    }
    return
}

function fetchFormFields(interaction: ModalSubmitInteraction): IEditableFields | null {
    const likesToTrendField = interaction.fields.getField('likesToTrendField', ComponentType.TextInput).value
    const likesToTrend = likesToTrendField.length > 0 ? Number(likesToTrendField) : null;

    if (!likesToTrend) { return null }
    return { likesToTrend }
}