import { useState } from 'react';

export default function MemberManager({
    members,
    setMembers,
    mode,
    onOpenImport
}) {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const addMember = () => {
        const trimmed = newName.trim();
        if (!trimmed) return;

        // Check for duplicates
        if (members.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
            alert('Member already exists!');
            return;
        }

        const newMember = {
            id: Date.now(),
            name: trimmed,
            weight: 1 // Default weight for weighted mode
        };

        setMembers([...members, newMember]);
        setNewName('');
    };

    const deleteMember = (id) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const startEdit = (member) => {
        setEditingId(member.id);
        setEditValue(member.name);
    };

    const saveEdit = () => {
        const trimmed = editValue.trim();
        if (!trimmed) {
            setEditingId(null);
            return;
        }

        // Check for duplicates (excluding current)
        if (members.some(m => m.id !== editingId && m.name.toLowerCase() === trimmed.toLowerCase())) {
            alert('Member name already exists!');
            return;
        }

        setMembers(members.map(m =>
            m.id === editingId ? { ...m, name: trimmed } : m
        ));
        setEditingId(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addMember();
        }
    };

    const handleEditKeyPress = (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className="retro-panel h-full flex flex-col">
            <h2 className="retro-panel-title flex items-center gap-2">
                👥 Members ({members.length})
            </h2>

            {/* Add Member Input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter name..."
                    className="retro-input flex-1"
                    maxLength={20}
                />
                <button
                    onClick={addMember}
                    className="retro-btn retro-btn-success"
                    disabled={!newName.trim()}
                >
                    ➕
                </button>
            </div>

            {/* Import Button */}
            <button
                onClick={onOpenImport}
                className="retro-btn retro-btn-secondary w-full mb-4"
            >
                📥 Import List
            </button>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: '300px' }}>
                {members.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                        No members yet.<br />Add some above!
                    </p>
                ) : (
                    members.map((member, index) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-2 p-2"
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '2px solid var(--border-color)'
                            }}
                        >
                            <span
                                className="text-xs w-6 text-center"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {index + 1}
                            </span>

                            {editingId === member.id ? (
                                <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleEditKeyPress}
                                    onBlur={saveEdit}
                                    className="retro-input flex-1 py-1"
                                    autoFocus
                                    maxLength={20}
                                />
                            ) : (
                                <span className="flex-1 text-xs truncate">
                                    {member.name}
                                </span>
                            )}

                            <div className="flex gap-1">
                                {editingId !== member.id && (
                                    <button
                                        onClick={() => startEdit(member)}
                                        className="retro-btn retro-btn-secondary py-1 px-2"
                                        style={{ fontSize: '0.5rem' }}
                                    >
                                        ✏️
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteMember(member.id)}
                                    className="retro-btn retro-btn-danger py-1 px-2"
                                    style={{ fontSize: '0.5rem' }}
                                >
                                    ❌
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Clear All */}
            {members.length > 0 && (
                <button
                    onClick={() => {
                        if (confirm('Clear all members?')) {
                            setMembers([]);
                        }
                    }}
                    className="retro-btn retro-btn-danger w-full mt-4"
                    style={{ fontSize: '0.5rem' }}
                >
                    🗑️ Clear All
                </button>
            )}
        </div>
    );
}
