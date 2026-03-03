import { shuffleColors, RETRO_COLORS } from '../utils/colors';

const THEMES = [
    { id: 'default', name: 'Retro Purple', icon: '🟣' },
    { id: 'gameboy', name: 'GameBoy', icon: '🟢' },
    { id: 'neon', name: 'Arcade Neon', icon: '🔵' },
];

export default function SettingsPanel({
    mode,
    setMode,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    colorLocked,
    setColorLocked,
    onShuffleColors
}) {
    return (
        <div className="retro-panel">
            <h2 className="retro-panel-title mb-4">
                ⚙️ Settings
            </h2>

            {/* Mode Toggle */}
            <div className="mb-6">
                <label
                    className="text-xs block mb-2"
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                >
                    Draw Mode
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('class')}
                        className={`retro-btn flex-1 ${mode === 'class' ? '' : 'retro-btn-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '10px 8px' }}
                    >
                        🎓 Class
                    </button>
                    <button
                        onClick={() => setMode('game')}
                        className={`retro-btn flex-1 ${mode === 'game' ? '' : 'retro-btn-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '10px 8px' }}
                    >
                        🎮 Game
                    </button>
                </div>
                <p
                    className="mt-2 text-xs"
                    style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                >
                    {mode === 'class'
                        ? '⚡ Winner auto-removed after spin'
                        : '🔄 Winner stays in the wheel'}
                </p>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
                <label
                    className="text-xs block mb-2"
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                >
                    Theme
                </label>
                <div className="flex gap-2">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`retro-btn flex-1 ${theme === t.id ? '' : 'retro-btn-secondary'}`}
                            style={{ fontSize: '1.1rem', padding: '8px' }}
                            title={t.name}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sound Toggle */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <label
                        className="text-xs"
                        style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                    >
                        Sound Effects
                    </label>
                    <div
                        className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
                        onClick={() => setSoundEnabled(!soundEnabled)}
                    />
                </div>
                <p
                    className="mt-1 text-xs"
                    style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                >
                    {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
                </p>
            </div>

            {/* Color Options */}
            <div className="mb-2">
                <label
                    className="text-xs block mb-2"
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                >
                    Wheel Colors
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={onShuffleColors}
                        className="retro-btn retro-btn-secondary flex-1"
                        style={{ fontSize: '0.8rem' }}
                    >
                        🔀 Shuffle
                    </button>
                    <button
                        onClick={() => setColorLocked(!colorLocked)}
                        className={`retro-btn flex-1 ${colorLocked ? '' : 'retro-btn-secondary'}`}
                        style={{ fontSize: '0.8rem' }}
                    >
                        {colorLocked ? '🔒 Locked' : '🔓 Unlocked'}
                    </button>
                </div>
            </div>
        </div>
    );
}
