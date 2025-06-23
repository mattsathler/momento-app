import { ActionRowBuilder, ButtonInteraction, ComponentType, Interaction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle, Webhook } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { tryDeleteMessage } from "../../Utils/Messages";


export const openConfigureTrendsWebhooksModal: ICommand = {
    permission: Permission.moderator,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const modal = createTrendsWebhooksConfigurationModal(ctx, interaction)
        await interaction.showModal(modal);
        const interactionModal = await interaction.awaitModalSubmit({ time: 0 });
        await editWebhooksExec(ctx, interactionModal);
    }
}

async function editWebhooksExec(ctx: IContext, interaction: ModalSubmitInteraction) {
    await interaction.deferUpdate();
    if (!ctx.serverConfig) { throw new Error("Invalid server config!") }

    const formField = fetchFormFields(interaction);
    if (!formField) {
        await interaction.editReply({ content: 'Nada alterado em seus webhooks de trending. =)' }); return
    }

    await interaction.editReply("Alterando seus webhooks, aguarde...");
    let webhooksArray: (String | null)[] = [];
    formField.forEach((webhook, i) => {
        if (webhook) {
            webhooksArray.push(webhook);
        }
    })

    const newConfig = {
        trendWebhooks: webhooksArray
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

function fetchFormFields(interaction: ModalSubmitInteraction): (String | null)[] | null {
    const webhook_one = interaction.fields.getField('webhook_one', ComponentType.TextInput).value
    const webhook_two = interaction.fields.getField('webhook_two', ComponentType.TextInput).value
    const webhook_three = interaction.fields.getField('webhook_three', ComponentType.TextInput).value
    const webhook_four = interaction.fields.getField('webhook_four', ComponentType.TextInput).value

    if (!webhook_one && !webhook_two && !webhook_four && !webhook_three) { return null }
    return [webhook_one, webhook_two, webhook_three, webhook_four]
}

function createTrendsWebhooksConfigurationModal(ctx: IContext, interaction: Interaction): ModalBuilder {
    const webhooks = ctx.serverConfig?.trendWebhooks;
    const webhook_one = new TextInputBuilder()
        .setCustomId('webhook_one')
        .setPlaceholder(webhooks && webhooks[0] ? `${webhooks[0]?.slice(0, 50)}...` : 'Nenhum webhook!')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(`Webhook 1`)

    const webhook_two = new TextInputBuilder()
        .setCustomId(`webhook_two`)
        .setPlaceholder(webhooks && webhooks[1] ? `${webhooks[1]?.slice(0, 50)}...` : 'Nenhum webhook!')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(`Webhook 2`)

    const webhook_three = new TextInputBuilder()
        .setCustomId(`webhook_three`)
        .setPlaceholder(webhooks && webhooks[2] ? `${webhooks[2]?.slice(0, 50)}...` : 'Nenhum webhook!')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(`Webhook 3`)

    const webhook_four = new TextInputBuilder()
        .setCustomId(`webhook_four`)
        .setPlaceholder(webhooks && webhooks[3] ? `${webhooks[3]?.slice(0, 50)}...` : 'Nenhum webhook!')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel(`Webhook 4`)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(webhook_one)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(webhook_two)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(webhook_three)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(webhook_four)

    const modal = new ModalBuilder()
        .setTitle(`Configurar Webhooks`)
        .setCustomId(`configureTrendingWebhook`)
        .addComponents(AR1, AR2, AR3, AR4)

    return modal
}