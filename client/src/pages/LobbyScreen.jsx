import { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import socket from '../utils/socket';

const AVATAR_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
    '#f59e0b', '#ef4444', '#06b6d4', '#6366f1',
    '#14b8a6', '#f97316', '#e879f9', '#22d3ee',
];

export default function LobbyScreen() {
    const room = useGameStore((s) => s.room);
    const setRoom = useGameStore((s) => s.setRoom);
    const setScreen = useGameStore((s) => s.setScreen);

    const [triviaQ, setTriviaQ] = useState('');
    const [triviaA, setTriviaA] = useState('');
    const [copied, setCopied] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const isHost = room && socket.id === room.hostId;

    const copyCode = () => {
        if (room) {
            navigator.clipboard.writeText(room.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLeave = () => {
        socket.emit('leave_lobby', null, () => {
            setRoom(null);
            setScreen('home');
        });
    };

    const handleStart = () => {
        socket.emit('start_game', null, (res) => {
            if (!res.success) {
                alert(res.error || 'Failed to start');
            }
        });
    };

    const handleKick = (targetId) => {
        socket.emit('kick_player', { targetId });
    };

    const handleAddTrivia = () => {
        if (!triviaQ.trim() || !triviaA.trim()) return;
        socket.emit(
            'add_trivia',
            { question: { questionText: triviaQ.trim(), correctAnswer: triviaA.trim() } },
            () => {
                setTriviaQ('');
                setTriviaA('');
            }
        );
    };

    const handleDeleteTrivia = (triviaId) => {
        socket.emit('delete_trivia', { triviaId });
    };

    const handleUpdateSettings = (key, value) => {
        const newSettings = { [key]: value };
        socket.emit('update_settings', { settings: newSettings });
    };

    if (!room) return null;

    return (
        <div className="lobby-container">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="lobby-header">
                    <h1>TSUNAMI</h1>
                    <div
                        className="room-code-badge"
                        onClick={copyCode}
                        title="Click to copy"
                        id="room-code-display"
                    >
                        <span>{room.code}</span>
                        <span className="copy-icon">{copied ? '✓' : '📋'}</span>
                    </div>
                </div>

                <div className="lobby-grid">
                    {/* Left: Players */}
                    <div className="lobby-section glass-panel">
                        <h3>Players ({room.players.length}/{room.settings.maxPlayers})</h3>
                        {room.players.map((p, i) => (
                            <div className="player-item" key={p.id}>
                                <div className="player-info">
                                    <div
                                        className="player-avatar"
                                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                                    >
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>
                                        {p.name}
                                        {p.id === room.hostId && (
                                            <span className="badge badge-amber" style={{ marginLeft: 8 }}>
                                                HOST
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className={`badge ${p.connected ? 'badge-green' : 'badge-red'}`}>
                                        {p.connected ? 'Online' : 'Offline'}
                                    </span>
                                    {isHost && p.id !== socket.id && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleKick(p.id)}
                                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                        >
                                            Kick
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Settings & Trivia */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Settings */}
                        {isHost && (
                            <div className="lobby-section glass-panel">
                                <h3
                                    onClick={() => setSettingsOpen(!settingsOpen)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    ⚙️ Settings {settingsOpen ? '▾' : '▸'}
                                </h3>
                                {settingsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="settings-grid"
                                    >
                                        <div className="form-group">
                                            <label>Starting Points</label>
                                            <input
                                                className="input"
                                                type="number"
                                                value={room.settings.startingPoints}
                                                onChange={(e) =>
                                                    handleUpdateSettings('startingPoints', parseInt(e.target.value) || 1000)
                                                }
                                                min={100}
                                                step={100}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Max Players</label>
                                            <input
                                                className="input"
                                                type="number"
                                                value={room.settings.maxPlayers}
                                                onChange={(e) =>
                                                    handleUpdateSettings('maxPlayers', parseInt(e.target.value) || 12)
                                                }
                                                min={2}
                                                max={20}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Timer (seconds)</label>
                                            <input
                                                className="input"
                                                type="number"
                                                value={room.settings.triviaTimer}
                                                onChange={(e) =>
                                                    handleUpdateSettings('triviaTimer', parseInt(e.target.value) || 15)
                                                }
                                                min={5}
                                                max={60}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Custom Trivia */}
                        {isHost && (
                            <div className="lobby-section glass-panel">
                                <h3>📝 Custom Trivia ({room.trivia?.length || 0})</h3>
                                <div className="trivia-form">
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Question"
                                        value={triviaQ}
                                        onChange={(e) => setTriviaQ(e.target.value)}
                                        id="trivia-question-input"
                                    />
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Correct Answer"
                                        value={triviaA}
                                        onChange={(e) => setTriviaA(e.target.value)}
                                        id="trivia-answer-input"
                                    />
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleAddTrivia}
                                        id="add-trivia-btn"
                                    >
                                        + Add Question
                                    </button>
                                </div>
                                {room.trivia?.map((t) => (
                                    <div className="trivia-item" key={t.id}>
                                        <span className="q-text">{t.questionText}</span>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteTrivia(t.id)}
                                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {(!room.trivia || room.trivia.length === 0) && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        No custom questions yet. Default questions will be used.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lobby-start-area">
                    {isHost && (
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleStart}
                            id="start-game-btn"
                        >
                            🚀 Start Game
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={handleLeave}
                        id="leave-lobby-btn"
                    >
                        Leave Lobby
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
