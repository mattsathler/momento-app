import { ButtonInteraction } from "discord.js";
import { IContext } from "../../../Interfaces/IContext";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { tryDeleteMessage } from "../../../Utils/Messages";
import { Theme } from "src/shared/models/Theme";
import { User } from "src/shared/models/User";

export const deleteTheme: ICommand = {
    isProfileCommand: false,
    permission: Permission.user,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const user = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
        if (!user) { throw new Error('Invalid user') }

        const themeName = interaction.message.embeds[0].fields.find(field => field.name === 'Nome')?.value;
        if (!themeName) { throw new Error('Invalid theme name') }
        const theme = await ctx.mongoService.getOne('themes', { name: themeName }) as Theme;

        if (!theme) {
            await tryDeleteMessage(interaction.message);
            throw new Error('Esse tema não está mais disponível')
        }

        if (theme.creatorId !== interaction.user.id && user.permission == 0) {
            throw new Error('Somente o criador do tema ou um moderador pode deletá-lo!')
        }

        await interaction.reply({
            content: 'Deletando o tema, aguarde...',
            ephemeral: true
        })
        await ctx.mongoService.delete('themes', { name: themeName });
        await tryDeleteMessage(interaction.message);

        if (interaction.isRepliable()) {
            await interaction.editReply({
                content: 'Tema deletado com sucesso!',
            })
        }
        return;
    }
}