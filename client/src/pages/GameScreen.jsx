import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import socket from '../utils/socket';

export default function GameScreen() {
    const room = useGameStore((s) => s.room);
    const currentQuestion = useGameStore((s) => s.currentQuestion);
    const answerResult = useGameStore((s) => s.answerResult);
    const lastCardResult = useGameStore((s) => s.lastCardResult);
    const targetSelectInfo = useGameStore((s) => s.targetSelectInfo);
    const setTargetSelectInfo = useGameStore((s) => s.setTargetSelectInfo);
    const setLastCardResult = useGameStore((s) => s.setLastCardResult);

    const [answer, setAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState(null);

    const myId = socket.id;
    const gs = room?.gameState;
    const phase = gs?.phase || 'question';
    const isMyTurn = gs?.turnPlayerId === myId;
    const board = gs?.board || [];
    const players = room?.players || [];
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    // Timer
    useEffect(() => {
        if (currentQuestion && phase === 'question') {
            setTimeLeft(currentQuestion.timeLimit);
            setAnswer('');
            const timer = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentQuestion, phase]);

    // Show toast on card flip
    useEffect(() => {
        if (lastCardResult && lastCardResult.effects?.length > 0) {
            setToastContent(lastCardResult.effects[0]);
            setShowToast(true);
            const timer = setTimeout(() => {
                setShowToast(false);
                setLastCardResult(null);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [lastCardResult]);

    const handleSubmitAnswer = useCallback(() => {
        if (!answer.trim()) return;
        socket.emit('submit_answer', { answer: answer.trim() }, (res) => {
            if (res && !res.success) {
                // Already answered or phase changed
            }
        });
        setAnswer('');
    }, [answer]);

    const handlePickCard = (index) => {
        if (!isMyTurn || phase !== 'picking') return;
        const card = board[index];
        if (card?.flipped) return;

        socket.emit('pick_card', { cardIndex: index }, (res) => {
            if (res?.success && res.needsTarget) {
                // Target selection handled via select_target event
            }
        });
    };

    const handleSelectTarget = (targetId) => {
        socket.emit('select_target_player', { targetPlayerId: targetId }, () => {
            setTargetSelectInfo(null);
        });
    };

    const getCardTypeClass = (type) => {
        const map = {
            gain: 'card-gain',
            lose: 'card-lose',
            steal: 'card-steal',
            double: 'card-double',
            reverse: 'card-reverse',
            tsunami: 'card-tsunami',
            swap: 'card-swap',
        };
        return map[type] || '';
    };

    const timerPercent = currentQuestion
        ? (timeLeft / currentQuestion.timeLimit) * 100
        : 0;

    const hasAnswered =
        answerResult && (answerResult.correct || answerResult.playerId === myId);
    const someoneAnsweredCorrectly = answerResult?.correct && answerResult.playerId;
    const showCorrectAnswer =
        answerResult?.timeout ||
        (someoneAnsweredCorrectly && answerResult.playerId !== myId);

    return (
        <div className="game-container">
            {/* Top bar */}
            <div className="game-top-bar">
                <h1>TSUNAMI</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="badge badge-blue">
                        {board.filter((c) => !c.flipped).length} cards left
                    </span>
                    {gs?.activeModifier && (
                        <span
                            className={`modifier-indicator ${gs.activeModifier}`}
                        >
                            {gs.activeModifier === 'double' ? '⚡ DOUBLE ACTIVE' : '🔄 REVERSE ACTIVE'}
                        </span>
                    )}
                </div>
            </div>

            <div className="game-layout">
                {/* Main area */}
                <div className="game-main">
                    {/* Trivia section */}
                    <div className="glass-panel trivia-panel">
                        {phase === 'question' && currentQuestion && (
                            <>
                                <div className="timer-text">{timeLeft}s remaining</div>
                                <div className="timer-bar-container">
                                    <div
                                        className={`timer-bar ${timeLeft <= 5 ? 'urgent' : ''}`}
                                        style={{ width: `${timerPercent}%` }}
                                    />
                                </div>
                                <div className="question-text">{currentQuestion.questionText}</div>
                                {!hasAnswered && (
                                    <div className="answer-row">
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Type your answer..."
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                                            id="answer-input"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSubmitAnswer}
                                            id="submit-answer-btn"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}
                                {answerResult?.correct === false && answerResult.playerId === myId && (
                                    <p style={{ color: 'var(--accent-red)', marginTop: 8, fontSize: '0.9rem' }}>
                                        ✗ Wrong answer! Wait for the next question.
                                    </p>
                                )}
                                {showCorrectAnswer && answerResult.correctAnswer && (
                                    <div className="correct-answer-bar" style={{ marginTop: 8 }}>
                                        Answer: <span>{answerResult.correctAnswer}</span>
                                        {answerResult.playerName && ` — ${answerResult.playerName} got it!`}
                                    </div>
                                )}
                            </>
                        )}

                        {(phase === 'picking' || phase === 'target_select') && (
                            <div className="turn-indicator picking">
                                {isMyTurn
                                    ? '🎯 Pick a card from the board!'
                                    : `⏳ ${players.find((p) => p.id === gs?.turnPlayerId)?.name || 'Someone'} is picking a card...`}
                            </div>
                        )}
                    </div>

                    {/* Board */}
                    <div className="board-container">
                        {board.map((card, i) => {
                            const canPick = isMyTurn && phase === 'picking' && !card.flipped;
                            return (
                                <motion.div
                                    key={i}
                                    className={`card-cell ${card.flipped ? 'flipped' : ''} ${!canPick && !card.flipped ? 'disabled' : ''
                                        }`}
                                    onClick={() => canPick && handlePickCard(i)}
                                    whileHover={canPick ? { scale: 1.05 } : {}}
                                    whileTap={canPick ? { scale: 0.97 } : {}}
                                >
                                    <div className="card-inner">
                                        <div className="card-face card-front">
                                            <span className="card-logo">🌊</span>
                                        </div>
                                        <div
                                            className={`card-face card-back ${card.type ? getCardTypeClass(card.type) : ''
                                                }`}
                                        >
                                            <span className="card-label">{card.label || '?'}</span>
                                            <span className="card-type">{card.type || ''}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar: Scoreboard */}
                <div className="glass-panel scoreboard">
                    <h3>Scoreboard</h3>
                    {sortedPlayers.map((p, i) => (
                        <motion.div
                            key={p.id}
                            className={`score-item ${p.id === gs?.turnPlayerId ? 'is-turn' : ''}`}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <span className="rank">#{i + 1}</span>
                            <span className="player-name">
                                {p.name}
                                {p.id === myId && ' (You)'}
                            </span>
                            <span className="player-score">{p.score.toLocaleString()}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Target selection modal */}
            <AnimatePresence>
                {targetSelectInfo && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h2>
                                {targetSelectInfo.cardType === 'steal' && '🎯 Choose who to steal from'}
                                {targetSelectInfo.cardType === 'tsunami' && '🌊 Choose TSUNAMI target'}
                                {targetSelectInfo.cardType === 'swap' && '🔄 Choose who to swap with'}
                            </h2>
                            <p>Select a player to target with your {targetSelectInfo.label} card.</p>
                            <div className="target-list">
                                {players
                                    .filter((p) => p.id !== myId)
                                    .map((p) => (
                                        <button
                                            key={p.id}
                                            className="target-btn"
                                            onClick={() => handleSelectTarget(p.id)}
                                        >
                                            <span>{p.name}</span>
                                            <span className="target-score">{p.score.toLocaleString()} pts</span>
                                        </button>
                                    ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Effect toast */}
            <AnimatePresence>
                {showToast && toastContent && (
                    <motion.div
                        className="effect-toast"
                        style={{
                            background:
                                toastContent.type === 'gain'
                                    ? 'rgba(16, 185, 129, 0.9)'
                                    : toastContent.type === 'lose'
                                        ? 'rgba(239, 68, 68, 0.9)'
                                        : toastContent.type === 'tsunami' || toastContent.type === 'tsunami_reversed'
                                            ? 'rgba(217, 70, 239, 0.9)'
                                            : 'rgba(59, 130, 246, 0.9)',
                        }}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        {toastContent.description}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
