import { useState } from 'react';

export default function ImportModal({ onClose, onImport, existingMembers }) {
    const [textValue, setTextValue] = useState('');
    const [preview, setPreview] = useState([]);

    const handleTextChange = (e) => {
        const value = e.target.value;
        setTextValue(value);

        // Parse and preview
        const names = value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        // Remove duplicates (case-insensitive)
        const uniqueNames = [...new Set(names.map(n => n.toLowerCase()))]
            .map(lower => names.find(n => n.toLowerCase() === lower));

        // Filter out existing members
        const existingLower = existingMembers.map(m => m.name.toLowerCase());
        const newNames = uniqueNames.filter(n => !existingLower.includes(n.toLowerCase()));

        setPreview(newNames);
    };

    const handleImport = () => {
        if (preview.length === 0) return;

        const newMembers = preview.map((name, index) => ({
            id: Date.now() + index,
            name,
            weight: 1
        }));

        onImport(newMembers);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="retro-panel animate-slide-up max-w-lg w-full mx-4"
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-secondary)',
                    maxHeight: '80vh',
                    overflow: 'auto'
                }}
            >
                <h2 className="retro-panel-title mb-4">
                    📥 Import Members
                </h2>

                <p
                    className="text-xs mb-4"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.5rem' }}
                >
                    Paste names (one per line). Duplicates will be removed automatically.
                </p>

                {/* Text Input */}
                <textarea
                    value={textValue}
                    onChange={handleTextChange}
                    placeholder={`Andi\nBudi\nCitra\nDika`}
                    className="retro-textarea w-full mb-4"
                    rows={8}
                />

                {/* Preview */}
                {preview.length > 0 && (
                    <div className="mb-4">
                        <h3
                            className="text-xs mb-2"
                            style={{ color: 'var(--accent-primary)', fontSize: '0.5rem' }}
                        >
                            ✓ Will import ({preview.length} new):
                        </h3>
                        <div
                            className="p-2 text-xs space-y-1"
                            style={{
                                background: 'var(--bg-tertiary)',
                                maxHeight: '100px',
                                overflow: 'auto',
                                fontSize: '0.5rem'
                            }}
                        >
                            {preview.map((name, i) => (
                                <div key={i} style={{ color: 'var(--text-primary)' }}>
                                    {i + 1}. {name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Duplicate/existing notice */}
                {textValue && preview.length === 0 && (
                    <p
                        className="text-xs mb-4"
                        style={{ color: 'var(--accent-primary)', fontSize: '0.5rem' }}
                    >
                        ⚠️ All names are duplicates or already exist.
                    </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="retro-btn retro-btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={preview.length === 0}
                        className="retro-btn retro-btn-success flex-1"
                    >
                        Import ({preview.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
