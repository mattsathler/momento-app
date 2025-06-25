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