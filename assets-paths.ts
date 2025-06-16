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
};

export const fontsPaths = {
    SFPROBOLD: path.join(assetsRoot, 'fonts/SFPRODISPLAYBOLD.OTF'),
    SFPROMEDIUM: path.join(assetsRoot, 'fonts/SFPRODISPLAYMEDIUM.OTF'),
    SFPROREGULAR: path.join(assetsRoot, 'fonts/SFPRODISPLAYREGULAR.OTF'),
}