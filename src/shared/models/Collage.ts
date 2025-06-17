export interface Collage {
    id: number,
    authorId: string,
    isExclusive: boolean,
    gridTemplateColumns: number,
    gridTemplateRows: number,
    positions: string[]
}

export const defaultCollage: Collage = {
    id: 1,
    authorId: "bot",
    isExclusive: false,
    gridTemplateColumns: 3,
    gridTemplateRows: 2,
    positions: [
        "1 / 1 / 2 / 2",
        "1 / 2 / 2 / 3",
        "1 / 3 / 2 / 4",
        "2 / 1 / 3 / 2",
        "2 / 2 / 3 / 3",
        "2 / 3 / 3 / 4",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0",
        "0 / 0 / 0 / 0"
    ]
}
