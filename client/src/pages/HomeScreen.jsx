import { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import socket from '../utils/socket';

export default function HomeScreen() {
    const setRoom = useGameStore((s) => s.setRoom);
    const setScreen = useGameStore((s) => s.setScreen);
    const playerName = useGameStore((s) => s.playerName);
    const setPlayerName = useGameStore((s) => s.setPlayerName);
    const error = useGameStore((s) => s.error);
    const setError = useGameStore((s) => s.setError);

    const [roomCode, setRoomCode] = useState('');
    const [mode, setMode] = useState(null); // null | 'create' | 'join'
    const [loading, setLoading] = useState(false);

    const handleCreate = () => {
        if (!playerName.trim()) return setError('Please enter your name');
        setLoading(true);
        setError(null);
        socket.emit('create_lobby', { playerName: playerName.trim() }, (res) => {
            setLoading(false);
            if (res.success) {
                setRoom(res.room);
                setScreen('lobby');
            } else {
                setError(res.error || 'Failed to create lobby');
            }
        });
    };

    const handleJoin = () => {
        if (!playerName.trim()) return setError('Please enter your name');
        if (!roomCode.trim()) return setError('Please enter a room code');
        setLoading(true);
        setError(null);
        socket.emit(
            'join_lobby',
            { roomCode: roomCode.trim(), playerName: playerName.trim() },
            (res) => {
                setLoading(false);
                if (res.success) {
                    setRoom(res.room);
                    setScreen('lobby');
                } else {
                    setError(res.error || 'Failed to join lobby');
                }
            }
        );
    };

    return (
        <div className="home-container">
            {/* Animated background */}
            <div className="home-bg-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="home-title">TSUNAMI</h1>
                <p className="home-subtitle">Multiplayer Trivia Card Game</p>
            </motion.div>

            <motion.div
                className="home-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="glass-panel">
                    {error && <div className="error-msg">{error}</div>}

                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            id="player-name-input"
                            className="input"
                            type="text"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={20}
                        />
                    </div>

                    {!mode && (
                        <div className="home-actions">
                            <button
                                id="create-lobby-btn"
                                className="btn btn-primary btn-lg"
                                onClick={() => setMode('create')}
                            >
                                🌊 Create Lobby
                            </button>
                            <div className="home-divider">or</div>
                            <button
                                id="join-lobby-btn"
                                className="btn btn-secondary btn-lg"
                                onClick={() => setMode('join')}
                            >
                                🎮 Join Lobby
                            </button>
                        </div>
                    )}

                    {mode === 'create' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="home-actions"
                        >
                            <button
                                id="confirm-create-btn"
                                className="btn btn-primary btn-lg"
                                onClick={handleCreate}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Game'}
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setMode(null)}
                            >
                                ← Back
                            </button>
                        </motion.div>
                    )}

                    {mode === 'join' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label>Room Code</label>
                                <input
                                    id="room-code-input"
                                    className="input"
                                    type="text"
                                    placeholder="Enter 5-letter code"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    maxLength={5}
                                    style={{ letterSpacing: '0.15em', textAlign: 'center', fontSize: '1.2rem' }}
                                />
                            </div>
                            <div className="home-actions">
                                <button
                                    id="confirm-join-btn"
                                    className="btn btn-primary btn-lg"
                                    onClick={handleJoin}
                                    disabled={loading}
                                >
                                    {loading ? 'Joining...' : 'Join Game'}
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setMode(null)}
                                >
                                    ← Back
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
