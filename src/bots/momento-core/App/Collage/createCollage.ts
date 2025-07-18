import { ComponentType, Message, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { ProfileServices } from "../../Utils/ProfileServices";
import { Collage } from "src/shared/models/Collage";
import { CollageService } from "src/shared/services/CollageService";

export const createCollage: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    reply: 'Criando seu collage',
    success: 'Collage criado com sucesso!',
    exec: createNewCollage
}

async function createNewCollage(ctx: IContext, interaction: ModalSubmitInteraction) {
    if (!interaction.guild) { throw new Error('Invalid guild') };

    const collage = await fetchFormFields(ctx, interaction);
    if (!collage) { throw new Error('Informações inválidas! Consulte o guia para a criação de collages!') }
    if (interaction.isRepliable()) {
        await interaction.reply({ content: 'Criando seu collage...', ephemeral: true })
    }
    try {
        const collageService: CollageService = new CollageService();
        await collageService.createCollage(ctx.client, ctx.mongoService, interaction.user.username, collage);
        if (interaction.isRepliable()) {
            await interaction.editReply({ content: 'Collage criado com sucesso!' })
        }
    }
    catch (err: any) {
        if (interaction.isRepliable()) {
            await interaction.editReply({ content: err.message })
        }
    }
    return
}

async function fetchFormFields(ctx: IContext, interaction: ModalSubmitInteraction): Promise<Collage | null> {
    const gridStyle = interaction.fields.getField('grid_style', ComponentType.TextInput).value

    const collageLimit = await ctx.mongoService.count('collages', {});
    const positions: string[] = convertGridAreasToPositions(gridStyle);

    if (positions.length > 25 || positions.length < 1) throw new Error('Informações inválidas! Consulte o guia para a criação de collages!')
    const dimensions = getCollageDimensions(positions)
    const collage: Collage = {
        id: collageLimit + 1,
        authorId: interaction.user.id,
        gridTemplateColumns: dimensions.columns,
        gridTemplateRows: dimensions.rows,
        isExclusive: false,
        positions: [
            positions[0] ?? '0 / 0 / 0 / 0',
            positions[1] ?? '0 / 0 / 0 / 0',
            positions[2] ?? '0 / 0 / 0 / 0',
            positions[3] ?? '0 / 0 / 0 / 0',
            positions[4] ?? '0 / 0 / 0 / 0',
            positions[5] ?? '0 / 0 / 0 / 0',
            positions[6] ?? '0 / 0 / 0 / 0',
            positions[7] ?? '0 / 0 / 0 / 0',
            positions[8] ?? '0 / 0 / 0 / 0',
            positions[9] ?? '0 / 0 / 0 / 0',
            positions[10] ?? '0 / 0 / 0 / 0',
            positions[11] ?? '0 / 0 / 0 / 0',
            positions[12] ?? '0 / 0 / 0 / 0',
            positions[13] ?? '0 / 0 / 0 / 0',
            positions[14] ?? '0 / 0 / 0 / 0',
            positions[15] ?? '0 / 0 / 0 / 0',
            positions[16] ?? '0 / 0 / 0 / 0',
            positions[17] ?? '0 / 0 / 0 / 0',
            positions[18] ?? '0 / 0 / 0 / 0',
            positions[19] ?? '0 / 0 / 0 / 0',
            positions[20] ?? '0 / 0 / 0 / 0',
            positions[21] ?? '0 / 0 / 0 / 0',
            positions[22] ?? '0 / 0 / 0 / 0',
            positions[23] ?? '0 / 0 / 0 / 0',
            positions[24] ?? '0 / 0 / 0 / 0',
        ]
    }

    return collage;
}

function convertGridAreasToPositions(gridAreas: string): string[] {
    const positions: string[] = [];
    const regex = /(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/g;
    let match;
    while ((match = regex.exec(gridAreas)) !== null) {
        const rowStart = match[1];
        const colStart = match[2];
        const rowEnd = match[3];
        const colEnd = match[4];
        positions.push(`${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`);
    }
    return positions;
}

function getCollageDimensions(positions: string[]): { rows: number, columns: number } {
    let numRows = 0;
    let numCols = 0;

    // Encontra o maior valor de linha e coluna nas posições
    for (const position of positions) {
        const [rowStart, colStart, rowEnd, colEnd] = position.split('/').map(Number);
        numRows = Math.max(numRows, rowEnd);
        numCols = Math.max(numCols, colEnd);
    }

    return { rows: numRows - 1, columns: numCols - 1 };
}
