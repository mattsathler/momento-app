export class VideoService {
    constructor() { };

    public static async getVideoThumb(videoUrl: string, path: string): Promise<Buffer> {
        try {
            const fs = require('fs').promises;
            const extractFrames = require('ffmpeg-extract-frames')
            await extractFrames({
                input: videoUrl,
                output: `${path}/thumb.png`,
                offsets: [1000]
            })
            const thumb = await fs.readFile(`${path}/thumb.png`);
            if (!thumb) { throw new Error('Não foi possível criar a thumbnail do vídeo.'); }

            return thumb;
        } catch (err: any) {
            console.error('Erro ao capturar a thumb:', err);
            throw err;
        }
    }
}
