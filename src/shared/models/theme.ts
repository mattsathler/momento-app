export interface theme {
    name: string,
    creatorId: string,
    colors: {
        primary: string
        secondary: string
        background: string
    }
}

export const defaultTheme: theme = {
    name: 'light',
    creatorId: 'system',
    colors: {
        primary: "#000000",
        secondary: "#3B3B3B",
        background: "#FFFFFF",
    }
}