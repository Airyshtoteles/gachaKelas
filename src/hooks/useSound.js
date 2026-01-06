import { useRef, useCallback, useEffect } from 'react';

// Create audio context and oscillator for retro sounds
const createRetroSound = (type = 'spin') => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'spin') {
            // Tick sound for spinning
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
        } else if (type === 'win') {
            // Victory fanfare
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            let time = audioContext.currentTime;

            notes.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                osc.type = 'square';
                gain.gain.value = 0.15;
                osc.start(time + i * 0.15);
                osc.stop(time + i * 0.15 + 0.12);
            });
        }
    } catch (error) {
        console.log('Audio not supported');
    }
};

export function useSound(enabled = true) {
    const intervalRef = useRef(null);

    const playTick = useCallback(() => {
        if (enabled) {
            createRetroSound('spin');
        }
    }, [enabled]);

    const playWin = useCallback(() => {
        if (enabled) {
            createRetroSound('win');
        }
    }, [enabled]);

    const startSpinSound = useCallback((duration) => {
        if (!enabled) return;

        let tickInterval = 50; // Start fast
        let elapsed = 0;

        const tick = () => {
            if (elapsed >= duration) {
                clearInterval(intervalRef.current);
                return;
            }

            playTick();
            elapsed += tickInterval;

            // Slow down as we approach the end
            const progress = elapsed / duration;
            tickInterval = Math.min(50 + (progress * 200), 250);

            clearInterval(intervalRef.current);
            intervalRef.current = setTimeout(tick, tickInterval);
        };

        tick();
    }, [enabled, playTick]);

    const stopSpinSound = useCallback(() => {
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
            }
        };
    }, []);

    return { playTick, playWin, startSpinSound, stopSpinSound };
}
