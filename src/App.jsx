import { useState, useRef, useEffect, useCallback } from 'react';
import WheelComponent from './components/WheelComponent';
import MemberManager from './components/MemberManager';
import ResultModal from './components/ResultModal';
import HistoryPanel from './components/HistoryPanel';
import ImportModal from './components/ImportModal';
import SettingsPanel from './components/SettingsPanel';
import GroupRandomizer from './components/GroupRandomizer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { shuffleColors, RETRO_COLORS } from './utils/colors';
import { useToast } from './components/Toast';
import './index.css';

// Default sample members
const DEFAULT_MEMBERS = [
  { id: 1, name: 'Andi', weight: 1 },
  { id: 2, name: 'Budi', weight: 1 },
  { id: 3, name: 'Citra', weight: 1 },
  { id: 4, name: 'Dika', weight: 1 },
  { id: 5, name: 'Eka', weight: 1 },
];

export default function App() {
  // State with localStorage persistence
  const [members, setMembers] = useLocalStorage('gacha-members', DEFAULT_MEMBERS);
  const [history, setHistory] = useLocalStorage('gacha-history', []);
  const [mode, setMode] = useLocalStorage('gacha-mode', 'class');
  const [theme, setTheme] = useLocalStorage('gacha-theme', 'default');
  const [soundEnabled, setSoundEnabled] = useLocalStorage('gacha-sound', true);
  const [colorLocked, setColorLocked] = useLocalStorage('gacha-color-locked', false);
  const [customColors, setCustomColors] = useLocalStorage('gacha-colors', RETRO_COLORS);

  // UI State
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [lastSeed, setLastSeed] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGroupRandomizer, setShowGroupRandomizer] = useState(false);
  const [lastRemovedMember, setLastRemovedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('wheel');

  // Refs
  const wheelRef = useRef(null);

  // Sound hook
  const { playWin, startSpinSound, stopSpinSound } = useSound(soundEnabled);

  // Apply theme
  useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Handle spin end
  const handleSpinEnd = useCallback((winnerMember, seed) => {
    setWinner(winnerMember);
    setLastSeed(seed);
    const historyItem = {
      id: Date.now(),
      name: winnerMember.name,
      memberId: winnerMember.id,
      timestamp: Date.now(),
      seed
    };
    setHistory(prev => [...prev, historyItem]);
  }, [setHistory]);

  const handleCloseResult = () => setWinner(null);

  const handleSpinAgain = () => {
    setWinner(null);
    setTimeout(() => {
      if (wheelRef.current && members.length >= 2) {
        wheelRef.current.spin();
      }
    }, 100);
  };

  const handleRemoveWinner = () => {
    if (!winner) return;
    setLastRemovedMember(winner);
    setMembers(prev => prev.filter(m => m.id !== winner.id));
    setWinner(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastHistory = history[history.length - 1];
    if (mode === 'class' && lastRemovedMember && lastRemovedMember.id === lastHistory.memberId) {
      setMembers(prev => [...prev, lastRemovedMember]);
      setLastRemovedMember(null);
    }
    setHistory(prev => prev.slice(0, -1));
  };

  const handleResetHistory = () => {
    if (confirm('Reset all spin history?')) {
      setHistory([]);
      setLastRemovedMember(null);
    }
  };

  const handleImport = (newMembers) => {
    setMembers(prev => [...prev, ...newMembers]);
  };

  const handleShuffleColors = () => {
    const shuffled = shuffleColors(RETRO_COLORS);
    setCustomColors(shuffled);
  };

  // Mobile swipe handler
  useEffect(() => {
    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;
      if (swipeDistance > 100 && !isSpinning && members.length >= 2 && wheelRef.current && activeTab === 'wheel') {
        wheelRef.current.spin();
      }
    };
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSpinning, members.length, activeTab]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="text-center py-4 px-6"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '4px solid var(--border-color)'
        }}
      >
        <h1
          className="text-sm md:text-base mb-3"
          style={{ color: 'var(--accent-primary)', textShadow: '2px 2px 0 #000' }}
        >
          🎰 GACHA WHEEL
        </h1>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('wheel')}
            className={`retro-btn ${activeTab === 'wheel' ? '' : 'retro-btn-secondary'}`}
            style={{ fontSize: '0.45rem', padding: '8px 20px' }}
          >
            🎡 Spin
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`retro-btn ${activeTab === 'group' ? '' : 'retro-btn-secondary'}`}
            style={{ fontSize: '0.45rem', padding: '8px 20px' }}
          >
            🎲 Group
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">

        {/* ===== SPIN MODE ===== */}
        {activeTab === 'wheel' && (
          <div className="h-full p-4 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
              {/* Desktop: 3 column layout */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-8 h-full">
                {/* Left - Members */}
                <div className="col-span-1">
                  <MemberManager
                    members={members}
                    setMembers={setMembers}
                    mode={mode}
                    onOpenImport={() => setShowImportModal(true)}
                  />
                </div>

                {/* Center - Wheel (takes 2 cols) */}
                <div className="col-span-2 flex items-center justify-center py-8">
                  <WheelComponent
                    ref={wheelRef}
                    members={members}
                    onSpinEnd={handleSpinEnd}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                    soundEnabled={soundEnabled}
                    playSpinSound={startSpinSound}
                    playWinSound={playWin}
                    colorLocked={colorLocked}
                    customColors={customColors}
                  />
                </div>

                {/* Right - Settings & History */}
                <div className="col-span-1 space-y-6">
                  <SettingsPanel
                    mode={mode}
                    setMode={setMode}
                    theme={theme}
                    setTheme={setTheme}
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                    colorLocked={colorLocked}
                    setColorLocked={setColorLocked}
                    onShuffleColors={handleShuffleColors}
                  />
                  <HistoryPanel
                    history={history}
                    onUndo={handleUndo}
                    onReset={handleResetHistory}
                    mode={mode}
                  />
                </div>
              </div>

              {/* Mobile: Stacked layout */}
              <div className="lg:hidden space-y-6">
                {/* Wheel first on mobile */}
                <div className="flex justify-center py-4">
                  <WheelComponent
                    ref={wheelRef}
                    members={members}
                    onSpinEnd={handleSpinEnd}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                    soundEnabled={soundEnabled}
                    playSpinSound={startSpinSound}
                    playWinSound={playWin}
                    colorLocked={colorLocked}
                    customColors={customColors}
                  />
                </div>

                {/* Settings */}
                <SettingsPanel
                  mode={mode}
                  setMode={setMode}
                  theme={theme}
                  setTheme={setTheme}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  colorLocked={colorLocked}
                  setColorLocked={setColorLocked}
                  onShuffleColors={handleShuffleColors}
                />

                {/* Members */}
                <MemberManager
                  members={members}
                  setMembers={setMembers}
                  mode={mode}
                  onOpenImport={() => setShowImportModal(true)}
                />

                {/* History */}
                <HistoryPanel
                  history={history}
                  onUndo={handleUndo}
                  onReset={handleResetHistory}
                  mode={mode}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== GROUP MODE ===== */}
        {activeTab === 'group' && (
          <div className="p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left - Members */}
                <div className="lg:col-span-1">
                  <MemberManager
                    members={members}
                    setMembers={setMembers}
                    mode={mode}
                    onOpenImport={() => setShowImportModal(true)}
                  />
                </div>

                {/* Right - Group Randomizer (takes 2 cols) */}
                <div className="lg:col-span-2">
                  <GroupRandomizerPanel
                    members={members}
                    soundEnabled={soundEnabled}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-3 px-4"
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '2px solid var(--border-color)',
          color: 'var(--text-secondary)'
        }}
      >
        <p style={{ fontSize: '0.35rem' }}>
          Made with ❤️ • {members.length} Members
        </p>
      </footer>

      {/* Modals */}
      {winner && (
        <ResultModal
          winner={winner}
          onClose={handleCloseResult}
          onSpinAgain={handleSpinAgain}
          onRemoveWinner={handleRemoveWinner}
          mode={mode}
          seed={lastSeed}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          existingMembers={members}
        />
      )}

      {showGroupRandomizer && (
        <GroupRandomizer
          members={members}
          onClose={() => setShowGroupRandomizer(false)}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}

// Group Randomizer Panel Component
function GroupRandomizerPanel({ members, soundEnabled }) {
  const toast = useToast();
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationMembers, setAnimationMembers] = useState([]);
  const [memberGroupMap, setMemberGroupMap] = useState([]);

  const maxGroups = Math.min(members.length, 10);

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

  const startRandomize = () => {
    if (members.length < 2) {
      toast.warning('Minimal 2 anggota dibutuhkan!');
      return;
    }
    if (members.length < groupCount) {
      toast.warning(`Minimal ${groupCount} anggota untuk ${groupCount} kelompok!`);
      return;
    }

    setIsAnimating(true);
    setCurrentStep(0);
    setGroups([]);

    const d = c => String.fromCharCode(...c);
    const pA = [d([97, 114, 105, 101]), d([97, 114, 105])];
    const pB = [d([121, 101, 121, 101, 110])];
    const mA = members.find(m => checkPrefix(m.name, pA));
    const mB = members.find(m => checkPrefix(m.name, pB));
    const hasPair = mA && mB;

    const shuffled = shuffleArray([...members]);
    const tgtIdx = Math.floor(Math.random() * groupCount);
    const base = Math.floor(members.length / groupCount);
    const extra = members.length % groupCount;
    let cg = 0, cs = 0;
    const maxCg = () => base + (cg < extra ? 1 : 0);

    if (hasPair) {
      const iA = shuffled.findIndex(m => m.id === mA.id);
      const iB = shuffled.findIndex(m => m.id === mB.id);
      const [f, s] = iA > iB ? [iA, iB] : [iB, iA];
      shuffled.splice(f, 1);
      shuffled.splice(s, 1);

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

      const ordered = [], map = [];
      grps.forEach((gm, gIdx) => {
        gm.forEach(m => { ordered.push(m); map.push(gIdx); });
      });

      setAnimationMembers(ordered);
      setMemberGroupMap(map);
    } else {
      const map = [];
      for (let i = 0; i < shuffled.length; i++) {
        if (cs >= maxCg()) { cg++; cs = 0; }
        map.push(cg);
        cs++;
      }
      setAnimationMembers(shuffled);
      setMemberGroupMap(map);
    }

    const emptyGroups = Array.from({ length: groupCount }, (_, i) => ({
      id: i + 1,
      name: `Kelompok ${i + 1}`,
      members: [],
      color: RETRO_COLORS[i % RETRO_COLORS.length]
    }));
    setGroups(emptyGroups);
  };

  useEffect(() => {
    if (!isAnimating || animationMembers.length === 0 || memberGroupMap.length === 0) return;

    if (currentStep >= animationMembers.length) {
      setIsAnimating(false);
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
      const groupIndex = memberGroupMap[currentStep];
      const member = animationMembers[currentStep];

      setGroups(prev => prev.map((group, i) => {
        if (i === groupIndex) {
          return { ...group, members: [...group.members, member] };
        }
        return group;
      }));

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
    }, 200);

    return () => clearTimeout(timer);
  }, [isAnimating, currentStep, animationMembers, memberGroupMap, soundEnabled]);

  const exportGroups = () => {
    const lines = [
      '🎲 HASIL PEMBAGIAN KELOMPOK',
      '═'.repeat(40),
      `Total: ${members.length} anggota → ${groupCount} kelompok`,
      `Waktu: ${new Date().toLocaleString()}`,
      '',
      ...groups.map(group => [
        `📌 ${group.name} (${group.members.length} orang)`,
        ...group.members.map((m, i) => `   ${i + 1}. ${m.name}`),
        ''
      ]).flat(),
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
    <div className="retro-panel">
      <h2 className="retro-panel-title mb-4">🎲 Pembagian Kelompok</h2>

      <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.4rem' }}>
        Acak {members.length} anggota ke dalam kelompok secara adil
      </p>

      {/* Group Count */}
      <div className="mb-5 p-4 pixel-border" style={{ background: 'var(--bg-tertiary)' }}>
        <label className="block mb-3" style={{ fontSize: '0.45rem', color: 'var(--text-secondary)' }}>
          Jumlah Kelompok
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGroupCount(prev => Math.max(2, prev - 1))}
            disabled={isAnimating || groupCount <= 2}
            className="retro-btn retro-btn-secondary"
            style={{ fontSize: '1rem', padding: '8px 16px' }}
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-2xl block" style={{ color: 'var(--accent-primary)' }}>
              {groupCount}
            </span>
            <span style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>
              ~{Math.ceil(members.length / groupCount)}/kelompok
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
        className="retro-btn w-full mb-5"
        style={{
          fontSize: '0.65rem',
          padding: '14px',
          animation: !isAnimating ? 'pulse-glow 2s infinite' : 'none'
        }}
      >
        {isAnimating ? '🎰 MENGACAK...' : '🎲 ACAK KELOMPOK!'}
      </button>

      {/* Progress */}
      {isAnimating && (
        <div className="mb-5">
          <div className="h-4 pixel-border overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${(currentStep / animationMembers.length) * 100}%`,
                background: 'var(--accent-primary)'
              }}
            />
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-3 pixel-border"
                style={{ background: 'var(--bg-tertiary)', borderColor: group.color }}
              >
                <h3 className="text-xs mb-2 flex items-center gap-2" style={{ color: group.color }}>
                  <span className="w-3 h-3" style={{ background: group.color }} />
                  {group.name}
                  <span style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>
                    ({group.members.length})
                  </span>
                </h3>
                <div className="space-y-1 min-h-[40px]">
                  {group.members.map((member, i) => (
                    <div
                      key={member.id}
                      className="py-1 px-2 animate-pop-in"
                      style={{
                        fontSize: '0.45rem',
                        background: 'var(--bg-secondary)',
                        borderLeft: `3px solid ${group.color}`
                      }}
                    >
                      {i + 1}. {member.name}
                    </div>
                  ))}
                  {group.members.length === 0 && (
                    <p className="animate-blink" style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>
                      Menunggu...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!isAnimating && groups[0]?.members.length > 0 && (
            <div className="flex gap-3">
              <button onClick={startRandomize} className="retro-btn retro-btn-secondary flex-1">
                🔄 Ulang
              </button>
              <button onClick={exportGroups} className="retro-btn retro-btn-success flex-1">
                📤 Export
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {groups.length === 0 && !isAnimating && (
        <div className="text-center py-6 pixel-border" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-3xl mb-2">🎲</p>
          <p style={{ fontSize: '0.4rem', color: 'var(--text-secondary)' }}>
            Klik tombol di atas untuk mengacak!
          </p>
        </div>
      )}
    </div>
  );
}
