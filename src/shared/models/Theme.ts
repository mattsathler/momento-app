export interface Theme {
    name: string,
    creatorId: string,
    is_system_theme: boolean,
    last_use: Date,
    images: {
        'profile-background': string | null,
        'collage-background': string | null,
    } | null,
    colors: {
        primary: string
        secondary: string
        background: string
        surface?: string
    }
}

export const defaultTheme: Theme = {
    name: 'light',
    creatorId: 'system',
    is_system_theme: true,
    last_use: new Date(),
    images: {
        'profile-background': null,
        'collage-background': null,
    },
    colors: {
        primary: "#000000",
        secondary: "#3B3B3B",
        background: "#FFFFFF",
        surface: "F0F0F0",
    }
}