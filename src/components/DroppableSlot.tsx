import { useDroppable } from '@dnd-kit/core';

interface DroppableSlotProps {
    id: string;
    expectedChar: string;
    isCorrect: boolean;
}

export function DroppableSlot({ id, expectedChar, isCorrect }: DroppableSlotProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    });

    const getKeyWidth = () => {
        if (expectedChar === 'Space') return '320px';
        if (expectedChar === 'Backspace') return '100px';
        if (expectedChar === 'Tab') return '70px';
        if (expectedChar === 'CapsLock') return '85px';
        if (expectedChar === 'Enter') return '85px';
        if (expectedChar.includes('Shift')) return '95px';
        if (expectedChar.includes('Ctrl')) return '65px';
        if (expectedChar === 'Alt') return '60px';
        if (expectedChar === 'AltGr') return '65px';
        return '40px';
    };

    const getFontSize = () => {
        if (expectedChar.length > 5) return '10px';
        if (expectedChar.length > 3) return '12px';
        return '18px';
    };

    // Display sadece "Shift" ve "Ctrl" göster
    const displayText = expectedChar.replace('Left', '').replace('Right', '');

    return (
        <div
            ref={setNodeRef}
            style={{
                padding: '10px 8px',
                border: isOver ? '2px solid #00d9ff' : '2px dashed #3a506b',
                borderRadius: '6px',
                backgroundColor: isOver ? 'rgba(0,173,181,0.2)' : isCorrect ? 'rgba(0,173,181,0.3)' : 'rgba(30,58,95,0.5)',
                width: getKeyWidth(),
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getFontSize(),
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                color: isCorrect ? '#00d9ff' : '#3a506b',
                boxShadow: isCorrect ? '0 0 15px rgba(0,173,181,0.5)' : 'none',
                flexShrink: 0,
            }}
        >
            {isCorrect ? displayText : ''}
        </div>
    );
}
