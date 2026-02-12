import { create } from 'zustand';

const useGameStore = create((set, get) => ({
    // Connection
    connected: false,
    setConnected: (val) => set({ connected: val }),

    // User
    playerName: '',
    setPlayerName: (name) => set({ playerName: name }),

    // Screen
    screen: 'home', // home | lobby | game | end
    setScreen: (screen) => set({ screen }),

    // Room
    room: null,
    setRoom: (room) => set({ room }),

    // Game state
    gameState: null,
    setGameState: (gs) => set({ gameState: gs }),

    // Trivia
    currentQuestion: null,
    setCurrentQuestion: (q) => set({ currentQuestion: q }),

    // Answer result
    answerResult: null,
    setAnswerResult: (r) => set({ answerResult: r }),

    // Card flip result
    lastCardResult: null,
    setLastCardResult: (r) => set({ lastCardResult: r }),

    // Target selection
    targetSelectInfo: null,
    setTargetSelectInfo: (info) => set({ targetSelectInfo: info }),

    // Game over data
    gameOverData: null,
    setGameOverData: (data) => set({ gameOverData: data }),

    // Error
    error: null,
    setError: (err) => set({ error: err }),

    // Reset
    resetGame: () =>
        set({
            gameState: null,
            currentQuestion: null,
            answerResult: null,
            lastCardResult: null,
            targetSelectInfo: null,
            gameOverData: null,
        }),

    resetAll: () =>
        set({
            connected: false,
            playerName: '',
            screen: 'home',
            room: null,
            gameState: null,
            currentQuestion: null,
            answerResult: null,
            lastCardResult: null,
            targetSelectInfo: null,
            gameOverData: null,
            error: null,
        }),
}));

export default useGameStore;
