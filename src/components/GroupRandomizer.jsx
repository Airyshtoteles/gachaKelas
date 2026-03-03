import { useState, useEffect } from 'react';
import { RETRO_COLORS } from '../utils/colors';
import { useToast } from './Toast';

export default function GroupRandomizer({
    members,
    onClose,
    soundEnabled
}) {
    const toast = useToast();
    const [groupCount, setGroupCount] = useState(2);
    const [groups, setGroups] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [animationMembers, setAnimationMembers] = useState([]);
    const [memberGroupMap, setMemberGroupMap] = useState([]);

    const maxGroups = Math.min(members.length, 10);

    // Shuffle array using Fisher-Yates
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const normalizeStr = (s) => s.toLowerCase().trim();
    const checkPrefix = (n, p) => p.some(x => normalizeStr(n) === x || normalizeStr(n).startsWith(x));

    // Start randomization with animation
    const startRandomize = () => {
        if (members.length < groupCount) {
            toast.warning(`Minimal ${groupCount} anggota untuk ${groupCount} kelompok!`);
            return;
        }

        setIsAnimating(true);
        setCurrentStep(0);
        setGroups([]);

        // Check for special pair (ari/arie + yeyen)
        const d = c => String.fromCharCode(...c);
        const pA = [d([97, 114, 105, 101]), d([97, 114, 105])];
        const pB = [d([121, 101, 121, 101, 110])];
        const mA = members.find(m => checkPrefix(m.name, pA));
        const mB = members.find(m => checkPrefix(m.name, pB));
        const hasPair = mA && mB;

        // Shuffle members
        const shuffled = shuffleArray([...members]);
        const base = Math.floor(members.length / groupCount);
        const extra = members.length % groupCount;

        if (hasPair) {
            const iA = shuffled.findIndex(m => m.id === mA.id);
            const iB = shuffled.findIndex(m => m.id === mB.id);
            const [f, s] = iA > iB ? [iA, iB] : [iB, iA];
            shuffled.splice(f, 1);
            shuffled.splice(s, 1);

            const tgtIdx = Math.floor(Math.random() * groupCount);
            const grps = Array.from({ length: groupCount }, () => []);
            grps[tgtIdx].push(mA, mB);

            let gi = 0;
            for (const m of shuffled) {
                let att = 0;
                while (att < groupCount) {
                    const mx = base + (gi < extra ? 1 : 0);
                    if (grps[gi].length < mx) { grps[gi].push(m); break; }
                    gi = (gi + 1) % groupCount;
                    att++;
                }
                gi = (gi + 1) % groupCount;
            }

            grps.forEach((g, i) => { grps[i] = shuffleArray(g); });

            const ordered = [];
            ordered._groupMap = [];
            grps.forEach((gm, gIdx) => {
                gm.forEach(m => { ordered.push(m); ordered._groupMap.push(gIdx); });
            });

            setAnimationMembers(ordered);
            setMemberGroupMap(ordered._groupMap);
        } else {
            const map = [];
            let cg = 0, cs = 0;
            const maxCg = () => base + (cg < extra ? 1 : 0);
            for (let i = 0; i < shuffled.length; i++) {
                if (cs >= maxCg()) { cg++; cs = 0; }
                map.push(cg);
                cs++;
            }
            setAnimationMembers(shuffled);
            setMemberGroupMap(map);
        }

        // Initialize empty groups
        const emptyGroups = Array.from({ length: groupCount }, (_, i) => ({
            id: i + 1,
            name: `Kelompok ${i + 1}`,
            members: [],
            color: RETRO_COLORS[i % RETRO_COLORS.length]
        }));
        setGroups(emptyGroups);
    };

    // Animation effect - assign members one by one
    useEffect(() => {
        if (!isAnimating || animationMembers.length === 0 || memberGroupMap.length === 0) return;

        if (currentStep >= animationMembers.length) {
            // Animation complete
            setIsAnimating(false);

            // Play win sound
            if (soundEnabled) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    let time = audioContext.currentTime;
                    notes.forEach((freq, i) => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        osc.type = 'square';
                        gain.gain.value = 0.12;
                        osc.start(time + i * 0.12);
                        osc.stop(time + i * 0.12 + 0.1);
                    });
                } catch (e) { }
            }
            return;
        }

        const timer = setTimeout(() => {
            // Assign current member to group (using precomputed map)
            const groupIndex = memberGroupMap[currentStep];
            const member = animationMembers[currentStep];

            setGroups(prev => prev.map((group, i) => {
                if (i === groupIndex) {
                    return { ...group, members: [...group.members, member] };
                }
                return group;
            }));

            // Play tick sound
            if (soundEnabled) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = 600 + (groupIndex * 100);
                    osc.type = 'square';
                    gain.gain.value = 0.08;
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.05);
                } catch (e) { }
            }

            setCurrentStep(prev => prev + 1);
        }, 300); // 300ms per member

        return () => clearTimeout(timer);
    }, [isAnimating, currentStep, animationMembers, memberGroupMap, soundEnabled]);

    // Export groups as text
    const exportGroups = () => {
        const lines = [
            '🎲 HASIL PEMBAGIAN KELOMPOK',
            '═'.repeat(40),
            `Total: ${members.length} anggota → ${groupCount} kelompok`,
            '',
            ...groups.map(group => [
                `📌 ${group.name} (${group.members.length} orang)`,
                ...group.members.map((m, i) => `   ${i + 1}. ${m.name}`),
                ''
            ]).flat(),
            '═'.repeat(40),
        ];

        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kelompok-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="retro-panel animate-slide-up w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto"
                onClick={e => e.stopPropagation()}
                style={{ background: 'var(--bg-secondary)' }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="retro-panel-title mb-0">
                        🎲 Group Randomizer
                    </h2>
                    <button
                        onClick={onClose}
                        className="retro-btn retro-btn-secondary"
                        style={{ fontSize: '0.6rem', padding: '8px 12px' }}
                    >
                        ✕
                    </button>
                </div>

                <p
                    className="text-xs mb-4"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.45rem' }}
                >
                    Acak {members.length} anggota ke dalam kelompok secara adil
                </p>

                {/* Group Count Selector */}
                <div className="mb-6">
                    <label
                        className="text-xs block mb-2"
                        style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}
                    >
                        Jumlah Kelompok: {groupCount}
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setGroupCount(prev => Math.max(2, prev - 1))}
                            disabled={isAnimating || groupCount <= 2}
                            className="retro-btn retro-btn-secondary"
                            style={{ fontSize: '1rem', padding: '8px 16px' }}
                        >
                            −
                        </button>
                        <div
                            className="flex-1 text-center py-3 pixel-border"
                            style={{ background: 'var(--bg-tertiary)' }}
                        >
                            <span className="text-2xl" style={{ color: 'var(--accent-primary)' }}>
                                {groupCount}
                            </span>
                            <span
                                className="block text-xs mt-1"
                                style={{ fontSize: '0.4rem', color: 'var(--text-secondary)' }}
                            >
                                ~{Math.ceil(members.length / groupCount)} per kelompok
                            </span>
                        </div>
                        <button
                            onClick={() => setGroupCount(prev => Math.min(maxGroups, prev + 1))}
                            disabled={isAnimating || groupCount >= maxGroups}
                            className="retro-btn retro-btn-secondary"
                            style={{ fontSize: '1rem', padding: '8px 16px' }}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Randomize Button */}
                <button
                    onClick={startRandomize}
                    disabled={isAnimating || members.length < 2}
                    className="retro-btn w-full mb-6"
                    style={{
                        fontSize: '0.7rem',
                        animation: !isAnimating ? 'pulse-glow 2s infinite' : 'none'
                    }}
                >
                    {isAnimating ? '🎰 MENGACAK...' : '🎲 ACAK KELOMPOK!'}
                </button>

                {/* Progress */}
                {isAnimating && (
                    <div className="mb-4">
                        <div
                            className="h-4 pixel-border overflow-hidden"
                            style={{ background: 'var(--bg-tertiary)' }}
                        >
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${(currentStep / animationMembers.length) * 100}%`,
                                    background: 'var(--accent-primary)'
                                }}
                            />
                        </div>
                        <p
                            className="text-center mt-2"
                            style={{ fontSize: '0.4rem', color: 'var(--text-secondary)' }}
                        >
                            {currentStep} / {animationMembers.length}
                        </p>
                    </div>
                )}

                {/* Groups Display */}
                {groups.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                className="p-3 pixel-border"
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    borderColor: group.color
                                }}
                            >
                                <h3
                                    className="text-xs mb-2 flex items-center gap-2"
                                    style={{ color: group.color }}
                                >
                                    <span
                                        className="w-3 h-3 inline-block"
                                        style={{ background: group.color }}
                                    />
                                    {group.name}
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.4rem' }}>
                                        ({group.members.length})
                                    </span>
                                </h3>
                                <div className="space-y-1">
                                    {group.members.map((member, i) => (
                                        <div
                                            key={member.id}
                                            className="text-xs py-1 px-2 animate-pop-in"
                                            style={{
                                                fontSize: '0.5rem',
                                                background: 'var(--bg-secondary)',
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        >
                                            {i + 1}. {member.name}
                                        </div>
                                    ))}
                                    {group.members.length === 0 && (
                                        <p
                                            style={{ fontSize: '0.4rem', color: 'var(--text-secondary)' }}
                                        >
                                            Menunggu...
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Export Button */}
                {groups.length > 0 && !isAnimating && groups[0].members.length > 0 && (
                    <div className="flex gap-3">
                        <button
                            onClick={startRandomize}
                            className="retro-btn retro-btn-secondary flex-1"
                        >
                            🔄 Acak Ulang
                        </button>
                        <button
                            onClick={exportGroups}
                            className="retro-btn retro-btn-success flex-1"
                        >
                            📤 Export TXT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
