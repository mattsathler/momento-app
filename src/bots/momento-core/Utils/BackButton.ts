import { ButtonInteraction, Message, TextChannel } from "discord.js";
import { ICommand } from "../Interfaces/ICommand";
import { IContext } from "../Interfaces/IContext";
import { Permission } from "../Interfaces/IPermission";
import { tryDeleteMessage } from "./Messages";

export const backButton: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: backButtonPressed
}

async function backButtonPressed(ctx: IContext, interaction: ButtonInteraction) {
    const channel = await ctx.client.channels.fetch(interaction.channelId) as TextChannel;
    const message = await channel.messages.fetch(interaction.message.id as string) as Message;
    await tryDeleteMessage(message);

}