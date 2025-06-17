export interface Theme {
    name: string,
    creatorId: string,
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
    colors: {
        primary: "#000000",
        secondary: "#3B3B3B",
        background: "#FFFFFF",
        surface: "F0F0F0",
    }
}