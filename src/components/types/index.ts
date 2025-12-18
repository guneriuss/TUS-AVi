export interface KeyItem {
    id: string;
    char: string;
}

export interface SlotPosition {
    row: number;
    col: number;
    char: string;
}

export interface GameState {
    placedKeys: Record<string, string>;
    isCompleted: boolean;
}
