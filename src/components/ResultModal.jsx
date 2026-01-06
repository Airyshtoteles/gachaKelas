import { useEffect, useState } from 'react';

// Confetti component
function Confetti() {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#AA96DA', '#F38181', '#FCBAD3'];
        const newParticles = [];

        for (let i = 0; i < 50; i++) {
            newParticles.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 8 + Math.random() * 8
            });
        }

        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="confetti"
                    style={{
                        left: `${p.left}%`,
                        backgroundColor: p.color,
                        width: p.size,
                        height: p.size,
                        animationDelay: `${p.delay}s`
                    }}
                />
            ))}
        </div>
    );
}

export default function ResultModal({
    winner,
    onClose,
    onSpinAgain,
    onRemoveWinner,
    mode,
    seed
}) {
    const [showConfetti, setShowConfetti] = useState(true);
    const [isShaking, setIsShaking] = useState(true);

    useEffect(() => {
        // Screen shake effect
        document.body.classList.add('animate-screen-shake');
        const shakeTimer = setTimeout(() => {
            document.body.classList.remove('animate-screen-shake');
            setIsShaking(false);
        }, 300);

        // Hide confetti after animation
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
        }, 3000);

        return () => {
            clearTimeout(shakeTimer);
            clearTimeout(confettiTimer);
            document.body.classList.remove('animate-screen-shake');
        };
    }, []);

    if (!winner) return null;

    return (
        <>
            {showConfetti && <Confetti />}

            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="retro-panel animate-pop-in max-w-md w-full mx-4 text-center"
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '6px solid var(--accent-primary)',
                        boxShadow: '8px 8px 0 0 #000'
                    }}
                >
                    {/* Trophy Icon */}
                    <div className="text-6xl mb-4 animate-pulse-glow">
                        🏆
                    </div>

                    {/* Winner Text */}
                    <h2
                        className="text-xs mb-2 animate-blink"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        🎉 WINNER! 🎉
                    </h2>

                    {/* Winner Name */}
                    <div
                        className="pixel-border-accent p-4 mb-6"
                        style={{ background: 'var(--bg-primary)' }}
                    >
                        <h1
                            className="text-lg break-words"
                            style={{
                                color: 'var(--text-primary)',
                                textShadow: '2px 2px 0 var(--accent-primary)'
                            }}
                        >
                            {winner.name}
                        </h1>
                    </div>

                    {/* Seed info */}
                    <p className="seed-display mb-6">
                        Seed: {seed}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onSpinAgain}
                            className="retro-btn w-full"
                        >
                            🔄 Spin Again
                        </button>

                        {mode === 'class' && (
                            <button
                                onClick={onRemoveWinner}
                                className="retro-btn retro-btn-danger w-full"
                            >
                                🚫 Remove & Continue
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="retro-btn retro-btn-secondary w-full"
                        >
                            ✓ Close
                        </button>
                    </div>

                    {/* Mode indicator */}
                    <p
                        className="mt-4 text-xs"
                        style={{ color: 'var(--text-secondary)', fontSize: '0.45rem' }}
                    >
                        {mode === 'class' ? '🎓 Class Mode' : '🎮 Game Mode'}
                    </p>
                </div>
            </div>
        </>
    );
}
