import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getWheelColors, RETRO_COLORS } from '../utils/colors';
import { generateSeed } from '../hooks/useSeed';

const WheelComponent = forwardRef(({
    members,
    onSpinEnd,
    isSpinning,
    setIsSpinning,
    soundEnabled,
    playSpinSound,
    playWinSound,
    colorLocked,
    customColors
}, ref) => {
    const [rotation, setRotation] = useState(0);
    const [currentSeed, setCurrentSeed] = useState(generateSeed());
    const [winnerIndex, setWinnerIndex] = useState(null);
    const wheelRef = useRef(null);
    const colors = colorLocked && customColors ? customColors : getWheelColors(members.length, RETRO_COLORS);

    const size = 350;
    const center = size / 2;
    const radius = size / 2 - 10;

    useImperativeHandle(ref, () => ({
        spin: handleSpin,
        getSeed: () => currentSeed
    }));

    const handleSpin = () => {
        if (isSpinning || members.length < 2) return;

        setIsSpinning(true);
        setWinnerIndex(null);

        // Generate new seed for this spin
        const newSeed = generateSeed();
        setCurrentSeed(newSeed);

        // Random spin: 5-10 full rotations + random offset
        const fullRotations = 360 * (5 + Math.random() * 5);
        const randomOffset = Math.random() * 360;
        const totalRotation = rotation + fullRotations + randomOffset;

        setRotation(totalRotation);

        // Start spin sound
        if (soundEnabled && playSpinSound) {
            playSpinSound(5000);
        }

        // Calculate winner after spin ends
        setTimeout(() => {
            const normalizedAngle = totalRotation % 360;
            const segmentAngle = 360 / members.length;
            // Pointer is at top (270 degrees in SVG coordinate)
            const pointerAngle = (360 - normalizedAngle + 270) % 360;
            const index = Math.floor(pointerAngle / segmentAngle) % members.length;

            setWinnerIndex(index);
            setIsSpinning(false);

            if (soundEnabled && playWinSound) {
                playWinSound();
            }

            onSpinEnd(members[index], newSeed);
        }, 5000);
    };

    // Create wheel segments
    const createSegments = () => {
        if (members.length === 0) return null;
        if (members.length === 1) {
            // Single member - full circle
            return (
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={colors[0]}
                    stroke="#000"
                    strokeWidth="3"
                />
            );
        }

        const segments = [];
        const anglePerSegment = 360 / members.length;

        members.forEach((member, i) => {
            const startAngle = i * anglePerSegment - 90; // Start from top
            const endAngle = startAngle + anglePerSegment;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            const largeArc = anglePerSegment > 180 ? 1 : 0;

            const pathD = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

            // Text position (middle of segment)
            const textAngle = startAngle + anglePerSegment / 2;
            const textRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.65;
            const textX = center + textRadius * Math.cos(textRad);
            const textY = center + textRadius * Math.sin(textRad);

            const isWinner = winnerIndex === i && !isSpinning;

            segments.push(
                <g key={i} className={isWinner ? 'segment-winner' : ''}>
                    <path
                        d={pathD}
                        fill={colors[i % colors.length]}
                        stroke="#000"
                        strokeWidth="2"
                        style={{
                            filter: isWinner ? 'drop-shadow(0 0 15px gold)' : 'none',
                            transition: 'filter 0.3s ease'
                        }}
                    />
                    <text
                        x={textX}
                        y={textY}
                        fill="#000"
                        fontSize={Math.min(12, 120 / members.length)}
                        fontFamily="'Press Start 2P', cursive"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        style={{ pointerEvents: 'none' }}
                    >
                        {member.name.length > 8 ? member.name.substring(0, 7) + '..' : member.name}
                    </text>
                </g>
            );
        });

        return segments;
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Pointer */}
            <div className="relative">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderTop: '30px solid var(--accent-primary)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}
                />

                {/* Wheel */}
                <div
                    ref={wheelRef}
                    className="relative"
                    style={{
                        width: size,
                        height: size,
                    }}
                >
                    <svg
                        width={size}
                        height={size}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning
                                ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                                : 'none',
                        }}
                    >
                        {/* Wheel background */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius + 5}
                            fill="none"
                            stroke="var(--border-color)"
                            strokeWidth="8"
                        />

                        {/* Segments */}
                        {createSegments()}

                        {/* Center circle */}
                        <circle
                            cx={center}
                            cy={center}
                            r={30}
                            fill="var(--bg-primary)"
                            stroke="var(--accent-primary)"
                            strokeWidth="4"
                        />
                        <text
                            x={center}
                            y={center}
                            fill="var(--accent-primary)"
                            fontSize="10"
                            fontFamily="'Press Start 2P', cursive"
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            SPIN
                        </text>
                    </svg>
                </div>
            </div>

            {/* Spin Button */}
            <button
                onClick={handleSpin}
                disabled={isSpinning || members.length < 2}
                className="retro-btn text-lg px-8 py-4"
                style={{
                    fontSize: '0.9rem',
                    animation: !isSpinning && members.length >= 2 ? 'pulse-glow 2s infinite' : 'none'
                }}
            >
                {isSpinning ? '🎰 SPINNING...' : '🎲 SPIN!'}
            </button>

            {/* Seed Display */}
            <div className="seed-display">
                Seed: {currentSeed}
            </div>

            {/* Member count warning */}
            {members.length < 2 && (
                <p className="text-xs text-center" style={{ color: 'var(--accent-primary)' }}>
                    ⚠️ Add at least 2 members to spin
                </p>
            )}
        </div>
    );
});

WheelComponent.displayName = 'WheelComponent';

export default WheelComponent;
