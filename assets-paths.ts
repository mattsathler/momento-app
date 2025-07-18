import path from 'path';
import * as fs from 'fs';

/**
 * Caminho absoluto para o diretório 'assets/' na raiz do monorepo.
 */
const assetsRoot = path.resolve(__dirname, './src/assets');
const root = path.resolve(__dirname, './');

export const assetPaths = {
    analyticsIcon: path.join(assetsRoot, 'images/analytics.png'),
    noPhoto: path.join(assetsRoot, 'templates/no-photo.png'),
    likesIcon: path.join(assetsRoot, 'images/likes.png'),
    trendingIcon: path.join(assetsRoot, 'images/trending.png'),
    followersIcon: path.join(assetsRoot, 'images/followers.png'),
    verifiedIcon: path.join(assetsRoot, 'images/verified.png'),
    musicIcon: path.join(assetsRoot, 'images/music.png'),
    likeIcon: path.join(assetsRoot, 'images/like.png'),
    commentIcon: path.join(assetsRoot, 'images/comment.png'),
    shareIcon: path.join(assetsRoot, 'images/share.png'),
    locationIcon: path.join(assetsRoot, 'images/location.png'),
    questionIcon: path.join(assetsRoot, 'images/question.png'),
};


const fontsDir = path.join(assetsRoot, 'fonts');

export const fontsPaths: { name: string; path: string }[] = fs.readdirSync(fontsDir)
    .filter(file => /\.(otf|ttf)$/i.test(file)) // filtra apenas fontes
    .map(file => ({
        name: path.parse(file).name.toLowerCase(), // remove extensão
        path: path.join(fontsDir, file),
    }));


export const toolsPaths = {
    ffmpeg: path.join(root, 'tools/ffmpeg.exe'),
    ffplay: path.join(root, 'tools/ffplay.exe'),
    ffprobe: path.join(root, 'tools/ffprobe.exe'),
}