import { motion } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import socket from '../utils/socket';

const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function EndScreen() {
    const gameOverData = useGameStore((s) => s.gameOverData);
    const room = useGameStore((s) => s.room);
    const setScreen = useGameStore((s) => s.setScreen);
    const resetGame = useGameStore((s) => s.resetGame);

    const isHost = room && socket.id === room.hostId;
    const players = gameOverData?.players || [];
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    const handleRestart = () => {
        socket.emit('restart_game', null, (res) => {
            if (res.success) {
                resetGame();
                setScreen('lobby');
            }
        });
    };

    const handleHome = () => {
        socket.emit('leave_lobby');
        resetGame();
        useGameStore.getState().setRoom(null);
        setScreen('home');
    };

    return (
        <div className="end-container">
            <div className="home-bg-orbs">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            >
                <div className="winner-crown">👑</div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                Game Over!
            </motion.h1>

            {winner && (
                <motion.div
                    className="winner-name"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {winner.name} wins with {winner.score.toLocaleString()} points!
                </motion.div>
            )}

            <motion.div
                className="final-scores"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                {sorted.map((p, i) => (
                    <motion.div
                        key={p.id}
                        className={`final-score-item ${i === 0 ? 'first' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                    >
                        <span className="final-rank">
                            {RANK_EMOJIS[i] || `#${i + 1}`}
                        </span>
                        <span className="final-name">
                            {p.name}
                            {p.id === socket.id && ' (You)'}
                        </span>
                        <span className="final-pts">{p.score.toLocaleString()}</span>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="end-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                {isHost && (
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleRestart}
                        id="play-again-btn"
                    >
                        🔄 Play Again
                    </button>
                )}
                <button
                    className="btn btn-secondary btn-lg"
                    onClick={handleHome}
                    id="home-btn"
                >
                    🏠 Home
                </button>
            </motion.div>
        </div>
    );
}
