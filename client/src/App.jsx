import { useEffect } from 'react';
import useGameStore from './store/useGameStore';
import socket from './utils/socket';
import HomeScreen from './pages/HomeScreen';
import LobbyScreen from './pages/LobbyScreen';
import GameScreen from './pages/GameScreen';
import EndScreen from './pages/EndScreen';

export default function App() {
    const screen = useGameStore((s) => s.screen);
    const setConnected = useGameStore((s) => s.setConnected);
    const setRoom = useGameStore((s) => s.setRoom);
    const setScreen = useGameStore((s) => s.setScreen);
    const setCurrentQuestion = useGameStore((s) => s.setCurrentQuestion);
    const setAnswerResult = useGameStore((s) => s.setAnswerResult);
    const setLastCardResult = useGameStore((s) => s.setLastCardResult);
    const setTargetSelectInfo = useGameStore((s) => s.setTargetSelectInfo);
    const setGameOverData = useGameStore((s) => s.setGameOverData);

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('lobby_updated', (room) => {
            setRoom(room);
            if (room.status === 'lobby' && screen !== 'lobby') {
                setScreen('lobby');
            }
        });

        socket.on('trivia_updated', (trivia) => {
            const room = useGameStore.getState().room;
            if (room) setRoom({ ...room, trivia });
        });

        socket.on('game_started', (room) => {
            setRoom(room);
            setScreen('game');
        });

        socket.on('trivia_question', (question) => {
            setCurrentQuestion(question);
            setAnswerResult(null);
        });

        socket.on('answer_result', (result) => {
            setAnswerResult(result);
        });

        socket.on('card_flipped', (result) => {
            setLastCardResult(result);
            // Update board state locally
            const room = useGameStore.getState().room;
            if (room && room.gameState) {
                const board = [...room.gameState.board];
                const idx = result.cardIndex;
                board[idx] = {
                    ...board[idx],
                    flipped: true,
                    type: result.card.type,
                    value: result.card.value,
                    label: result.card.label,
                };
                setRoom({
                    ...room,
                    gameState: {
                        ...room.gameState,
                        board,
                        activeModifier:
                            result.card.type === 'double'
                                ? 'double'
                                : result.card.type === 'reverse'
                                    ? 'reverse'
                                    : null,
                    },
                });
            }
        });

        socket.on('select_target', (info) => {
            setTargetSelectInfo(info);
        });

        socket.on('score_update', ({ players }) => {
            const room = useGameStore.getState().room;
            if (room) {
                setRoom({
                    ...room,
                    players: room.players.map((p) => {
                        const updated = players.find((u) => u.id === p.id);
                        return updated ? { ...p, score: updated.score } : p;
                    }),
                });
            }
        });

        socket.on('game_over', (data) => {
            setGameOverData(data);
            setScreen('end');
        });

        socket.on('kicked', () => {
            setRoom(null);
            setScreen('home');
            useGameStore.getState().setError('You were kicked from the lobby.');
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, []);

    return (
        <>
            {screen === 'home' && <HomeScreen />}
            {screen === 'lobby' && <LobbyScreen />}
            {screen === 'game' && <GameScreen />}
            {screen === 'end' && <EndScreen />}
        </>
    );
}
