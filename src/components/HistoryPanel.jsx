import { exportToTxt } from '../utils/export';
import { useToast } from './Toast';

export default function HistoryPanel({
    history,
    onUndo,
    onReset,
    mode
}) {
    const toast = useToast();

    const handleExport = () => {
        if (history.length === 0) {
            toast.warning('Tidak ada history untuk di-export!');
            return;
        }
        exportToTxt(history);
        toast.success('History berhasil di-export!');
    };

    return (
        <div className="retro-panel h-full flex flex-col">
            <h2 className="retro-panel-title flex items-center gap-2">
                📜 History ({history.length})
            </h2>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={onUndo}
                    disabled={history.length === 0}
                    className="retro-btn retro-btn-secondary flex-1"
                    style={{ fontSize: '0.5rem' }}
                >
                    ↩️ Undo
                </button>
                <button
                    onClick={onReset}
                    disabled={history.length === 0}
                    className="retro-btn retro-btn-danger flex-1"
                    style={{ fontSize: '0.5rem' }}
                >
                    ♻️ Reset
                </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: '250px' }}>
                {history.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                        No spins yet.<br />Start spinning!
                    </p>
                ) : (
                    [...history].reverse().map((item, index) => (
                        <div
                            key={item.id}
                            className="p-2 text-xs"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '2px solid var(--border-color)'
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <span
                                    className="font-bold truncate flex-1"
                                    style={{ color: 'var(--accent-primary)' }}
                                >
                                    #{history.length - index} {item.name}
                                </span>
                            </div>
                            <div
                                className="mt-1 flex justify-between"
                                style={{ fontSize: '0.4rem', color: 'var(--text-secondary)' }}
                            >
                                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                <span>Seed: {item.seed}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={history.length === 0}
                className="retro-btn retro-btn-secondary w-full mt-4"
                style={{ fontSize: '0.5rem' }}
            >
                📤 Export TXT
            </button>
        </div>
    );
}
