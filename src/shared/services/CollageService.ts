import { Client } from "discord.js";
import { Collage } from "src/shared/models/Collage";
import { MongoService } from "src/shared/services/MongoService";
import { displayCollageInCatalogue } from "src/shared/services/ThemeService";

export class CollageService {

    public async createCollage(client: Client, mongoService: MongoService, username: string, collage: Collage): Promise<void> {
        collage.positions = this.normalizeCollagePositions(collage);
        const isCollageValid = this.validateGrid(collage.positions);
        if (!isCollageValid) throw new Error('Collage inválido! Verifique o guia para a criação de collages.')

        const collages: Collage[] = await mongoService.get("collages", {}) as Collage[];
        collages.forEach(c => {
            if (this.isDuplicated(collage, c)) {
                throw new Error(`Esse collage já existe! Confira o id: ${String(c.id)}`);
            }
        })
        await mongoService.post('collages', collage);
        await displayCollageInCatalogue(client, username, collage);
        return;
    }

    public isDuplicated(c1: Collage, c2: Collage): boolean {
        return this.getVisualFingerprint(c1.positions) === this.getVisualFingerprint(c2.positions);
    }

    public getVisualFingerprint(positions: string[]): string {
        return positions
            .filter(p => p !== "0 / 0 / 0 / 0")
            .map(p => p.trim())
            .sort()
            .join('|');
    }

    public normalizeCollagePositions(collage: { positions: string[] }): string[] {
        const visible = collage.positions.filter(p => p.trim() !== "0 / 0 / 0 / 0");
        const emptyCount = 25 - visible.length;
        const padded = [...visible, ...Array(emptyCount).fill("0 / 0 / 0 / 0")];
        return padded;
    }

    public validateGrid(positions: string[]): boolean {
        if (positions.length > 25) return false;

        const occupiedCellsMap: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));

        for (const position of positions) {
            if (position === "0 / 0 / 0 / 0") continue;

            const [rowStart, colStart, rowEnd, colEnd] = position.split(' / ').map(Number);

            if (
                rowStart < 1 || rowEnd > 6 || colStart < 1 || colEnd > 6 ||
                rowStart >= rowEnd || colStart >= colEnd
            ) {
                return false;
            }

            for (let row = rowStart; row < rowEnd; row++) {
                for (let col = colStart; col < colEnd; col++) {
                    const r = row - 1;
                    const c = col - 1;
                    if (occupiedCellsMap[r][c]) {
                        return false;
                    }
                    occupiedCellsMap[r][c] = true;
                }
            }
        }

        return true;
    }
}