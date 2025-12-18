import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';

interface DraggableKeyProps {
    id: string;
    char: string;
}

export function DraggableKey({ id, char }: DraggableKeyProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const [isHovered, setIsHovered] = useState(false);

    // Transform hesaplama
    let computedTransform: string | undefined;

    if (transform) {
        computedTransform = `translate3d(${transform.x}px, ${transform.y}px, 0)`;
    } else if (isHovered && !isDragging) {
        computedTransform = 'translateY(-3px) scale(1.05)';
    }

    const style = {
        transform: computedTransform,
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '10px 8px',
        border: isHovered ? '2px solid #00d9ff' : '2px solid rgba(0,173,181,0.5)',
        borderRadius: '8px',
        background: isHovered
            ? 'linear-gradient(135deg, #2a5298 0%, #1e3a5f 100%)'
            : 'linear-gradient(135deg, #1e3a5f 0%, #16213e 100%)',
        fontSize: char.length > 5 ? '10px' : char.length > 3 ? '12px' : '18px',
        fontWeight: 'bold' as const,
        textAlign: 'center' as const,
        width: char === 'Space' ? '280px' : char === 'Backspace' ? '90px' : char.includes('Shift') || char.includes('Ctrl') ? '90px' : char.length > 4 ? '80px' : '38px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHovered ? '#00d9ff' : '#93a8c1',
        opacity: isDragging ? 0 : 1,  // TAMAMEN GİZLE (0)
        transition: 'none',  // transition'u kaldır, anında kaybolsun
        userSelect: 'none' as const,
        touchAction: 'none',
    };

    const displayText = char.replace('Left', '').replace('Right', '');

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {displayText}
        </div>
    );
}
