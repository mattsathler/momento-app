import path from 'path';

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

export const fontsPaths: { name: string; path: string }[] = [
    { name: 'sfpro-bold', path: path.join(assetsRoot, 'fonts/sfpro/sfpro-bold.OTF') },
    { name: 'sfpro-medium', path: path.join(assetsRoot, 'fonts/sfpro/sfpro-medium.OTF') },
    { name: 'sfpro-regular', path: path.join(assetsRoot, 'fonts/sfpro/sfpro-regular.OTF') },

    { name: 'dancing-bold', path: path.join(assetsRoot, 'fonts/dancing/dancing-bold.ttf') },
    { name: 'dancing-medium', path: path.join(assetsRoot, 'fonts/dancing/dancing-medium.ttf') },
    { name: 'dancing-regular', path: path.join(assetsRoot, 'fonts/dancing/dancing-regular.ttf') },

    { name: 'worksans-bold', path: path.join(assetsRoot, 'fonts/worksans/worksans-bold.ttf') },
    { name: 'worksans-medium', path: path.join(assetsRoot, 'fonts/worksans/worksans-medium.ttf') },
    { name: 'worksans-regular', path: path.join(assetsRoot, 'fonts/worksans/worksans-regular.ttf') },
];


export const toolsPaths = {
    ffmpeg: path.join(root, 'tools/ffmpeg.exe'),
    ffplay: path.join(root, 'tools/ffplay.exe'),
    ffprobe: path.join(root, 'tools/ffprobe.exe'),
}