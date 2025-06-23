import path from 'path';

/**
 * Caminho absoluto para o diretório 'assets/' na raiz do monorepo.
 */
const assetsRoot = path.resolve(__dirname, './src/assets');

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
};

export const fontsPaths = {
    SFPROBOLD: path.join(assetsRoot, 'fonts/SFPRODISPLAYBOLD.OTF'),
    SFPROMEDIUM: path.join(assetsRoot, 'fonts/SFPRODISPLAYMEDIUM.OTF'),
    SFPROREGULAR: path.join(assetsRoot, 'fonts/SFPRODISPLAYREGULAR.OTF'),
}