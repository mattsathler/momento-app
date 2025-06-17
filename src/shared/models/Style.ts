export interface Sizes {
    tiny: number,
    small: number,
    medium: number,
    big: number,
    giant: number,
    huge: number,
    lineWidth: number,
}

export const Styles = {
    sizes: {
        large: {
            profile: {
                stats: {
                    width: 1920,
                    height: 1080,
                },
                collage: {
                    width: 1920,
                    height: 1080,
                }
            },
            post: {
                width: 1080,
                height: 1350,
            }
        },
        medium: {
            profile: {
                stats: {
                    width: 1280,
                    height: 720,
                },
                collage: {
                    width: 1280,
                    height: 720,
                }
            },
            post: {
                width: 680,
                height: 950,
            }
        },
        small: {
            profile: {
                stats: {
                    width: 800,
                    height: 600,
                },
                collage: {
                    width: 800,
                    height: 600,
                }
            },
            post: {
                width: 620,
                height: 830,
            }
        }
    }
}

export function calculateSizes(canvasWidth: number): Sizes {
    const sizes: Sizes = {
        tiny: 0.00625 * canvasWidth,
        small: 0.0125 * canvasWidth,
        medium: 0.01875 * canvasWidth,
        big: 0.03125 * canvasWidth,
        giant: 0.0375 * canvasWidth,
        huge: 0.05 * canvasWidth,
        lineWidth: 0.00078125 * canvasWidth,
    }

    return sizes
}

// export function calculatePostSizes(width: number, postDescription: string): {
//     postHeader: number,
//     postBar: number
// } {
//     let sizes: {
//         postHeader: number,
//         postBar: number
//     } = { postBar: 0, postHeader: 0 };

//     const postWidth = Styles.sizes.large.post.width;
//     const size = calculateSizes(postWidth);
//     let descriptionSize = 0

//     if (postDescription) {
//         const font = `SFPRODISPLAYMEDIUM`;
//         descriptionSize = drawTextInCanvas(postDescription, LightTheme, font, postWidth - (size.huge * 2), size.big).height
//     }
//     sizes.postHeader = Math.round(postWidth / 10 + size.huge);
//     sizes.postBar = Math.round(((size.medium * 2) + 50) + descriptionSize);
//     return sizes;
// }