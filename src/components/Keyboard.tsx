import { DroppableSlot } from './DroppableSlot';

const keyboardLayout = [
    { keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '-', 'Backspace'] },
    { keys: ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'] },
    { keys: ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ', 'Enter'] },
    { keys: ['LeftShift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', '.', 'RightShift'] },
    { keys: ['LeftCtrl', 'Alt', 'Space', 'AltGr', 'RightCtrl'] }
];

interface KeyboardProps {
    placedKeys: Record<string, string>;
}

export function Keyboard({ placedKeys }: KeyboardProps) {
    console.log('🎹 Keyboard render - placedKeys:', placedKeys);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(22,33,62,0.8) 0%, rgba(15,52,96,0.8) 100%)',
            borderRadius: '12px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(0,173,181,0.2)',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {keyboardLayout.map((row, rowIndex: number) => (
                <div
                    key={`row-${rowIndex}`}
                    style={{
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'center',
                    }}
                >
                    {row.keys.map((char: string, colIndex: number) => {
                        const slotId = `slot-${rowIndex}-${colIndex}`;
                        const isCorrect = placedKeys[slotId] === char ||
                            (char.includes('Shift') && placedKeys[slotId]?.includes('Shift')) ||
                            (char.includes('Ctrl') && placedKeys[slotId]?.includes('Ctrl'));

                        console.log(`Slot ${slotId}: expectedChar=${char}, placedChar=${placedKeys[slotId]}, isCorrect=${isCorrect}`);

                        return (
                            <DroppableSlot
                                key={slotId}
                                id={slotId}
                                expectedChar={char}
                                isCorrect={isCorrect}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
