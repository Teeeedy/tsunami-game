/**
 * TSUNAMI WebSocket Event Handlers
 * All client↔server communication logic.
 */

const {
    createRoom,
    getRoom,
    joinRoom,
    leaveRoom,
    kickPlayer,
    updateSettings,
    sanitizeRoom,
} = require('./rooms');
const { initGameState, applyCardEffect, cardRequiresTarget } = require('./gameLogic');
const { getNextQuestion, checkAnswer, addTrivia, editTrivia, deleteTrivia } = require('./trivia');

// Map socketId → { roomCode, playerId }
const socketMap = new Map();

function registerHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // ─── LOBBY ───

        socket.on('create_lobby', ({ playerName }, callback) => {
            const playerId = socket.id;
            const room = createRoom(playerId, playerName);
            socketMap.set(socket.id, { roomCode: room.code, playerId });
            socket.join(room.code);
            const cb = callback || (() => { });
            cb({ success: true, room: sanitizeRoom(room) });
            console.log(`[Lobby] ${playerName} created room ${room.code}`);
        });

        socket.on('join_lobby', ({ roomCode, playerName }, callback) => {
            const playerId = socket.id;
            const code = roomCode.toUpperCase().trim();
            const result = joinRoom(code, playerId, playerName);
            const cb = callback || (() => { });

            if (result.error) {
                cb({ success: false, error: result.error });
                return;
            }

            socketMap.set(socket.id, { roomCode: code, playerId });
            socket.join(code);
            cb({ success: true, room: sanitizeRoom(result.room) });
            socket.to(code).emit('lobby_updated', sanitizeRoom(result.room));
            console.log(`[Lobby] ${playerName} joined room ${code}`);
        });

        socket.on('leave_lobby', (_, callback) => {
            handleLeave(socket, io);
            const cb = callback || (() => { });
            cb({ success: true });
        });

        socket.on('kick_player', ({ targetId }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const result = kickPlayer(info.roomCode, socket.id, targetId);
            if (result.error) return cb({ success: false, error: result.error });

            // Notify kicked player
            io.to(targetId).emit('kicked');
            const targetSocket = io.sockets.sockets.get(targetId);
            if (targetSocket) {
                targetSocket.leave(info.roomCode);
                socketMap.delete(targetId);
            }

            cb({ success: true });
            io.to(info.roomCode).emit('lobby_updated', sanitizeRoom(result.room));
        });

        socket.on('update_settings', ({ settings }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const result = updateSettings(info.roomCode, socket.id, settings);
            if (result.error) return cb({ success: false, error: result.error });

            cb({ success: true });
            io.to(info.roomCode).emit('lobby_updated', sanitizeRoom(result.room));
        });

        // ─── TRIVIA MANAGEMENT ───

        socket.on('add_trivia', ({ question }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room) return cb({ success: false, error: 'Room not found' });

            const result = addTrivia(room, socket.id, question);
            if (result.error) return cb({ success: false, error: result.error });

            cb({ success: true });
            io.to(info.roomCode).emit('trivia_updated', result.trivia);
        });

        socket.on('edit_trivia', ({ triviaId, updates }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room) return cb({ success: false, error: 'Room not found' });

            const result = editTrivia(room, socket.id, triviaId, updates);
            if (result.error) return cb({ success: false, error: result.error });

            cb({ success: true });
            io.to(info.roomCode).emit('trivia_updated', result.trivia);
        });

        socket.on('delete_trivia', ({ triviaId }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room) return cb({ success: false, error: 'Room not found' });

            const result = deleteTrivia(room, socket.id, triviaId);
            if (result.error) return cb({ success: false, error: result.error });

            cb({ success: true });
            io.to(info.roomCode).emit('trivia_updated', result.trivia);
        });

        // ─── GAME ───

        socket.on('start_game', (_, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room) return cb({ success: false, error: 'Room not found' });
            if (room.hostId !== socket.id)
                return cb({ success: false, error: 'Only host can start the game' });
            if (room.players.length < 1)
                return cb({ success: false, error: 'Need at least 1 player' });

            initGameState(room);
            cb({ success: true });

            io.to(info.roomCode).emit('game_started', sanitizeRoom(room));

            // Send first question
            sendQuestion(io, room);
        });

        socket.on('submit_answer', ({ answer }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room || !room.gameState) return cb({ success: false, error: 'No active game' });
            if (room.gameState.phase !== 'question')
                return cb({ success: false, error: 'Not in question phase' });

            // Check if player already answered
            if (room.gameState.answeredPlayers.has(socket.id))
                return cb({ success: false, error: 'Already answered' });

            room.gameState.answeredPlayers.add(socket.id);

            const correct = checkAnswer(
                room.gameState.currentQuestion.correctAnswer,
                answer
            );

            if (correct) {
                // Clear timeout
                if (room.gameState.questionTimeout) {
                    clearTimeout(room.gameState.questionTimeout);
                    room.gameState.questionTimeout = null;
                }

                room.gameState.turnPlayerId = socket.id;
                room.gameState.phase = 'picking';

                const player = room.players.find((p) => p.id === socket.id);
                const playerName = player ? player.name : 'Unknown';

                cb({ success: true, correct: true });
                io.to(info.roomCode).emit('answer_result', {
                    correct: true,
                    playerId: socket.id,
                    playerName,
                    correctAnswer: room.gameState.currentQuestion.correctAnswer,
                });
            } else {
                cb({ success: true, correct: false });
                socket.emit('answer_result', {
                    correct: false,
                    playerId: socket.id,
                });
            }
        });

        socket.on('pick_card', ({ cardIndex, targetPlayerId }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room || !room.gameState) return cb({ success: false, error: 'No active game' });
            if (room.gameState.phase !== 'picking' && room.gameState.phase !== 'target_select')
                return cb({ success: false, error: 'Not in picking phase' });
            if (room.gameState.turnPlayerId !== socket.id)
                return cb({ success: false, error: 'Not your turn to pick' });

            // Peek at the card to see if target is needed
            const card = room.gameState.board[cardIndex];
            if (!card || card.flipped)
                return cb({ success: false, error: 'Invalid card' });

            if (cardRequiresTarget(card.type) && !targetPlayerId) {
                // Enter target selection phase
                room.gameState.phase = 'target_select';
                room.gameState._pendingCardIndex = cardIndex;
                cb({ success: true, needsTarget: true, cardType: card.type });
                socket.emit('select_target', {
                    cardType: card.type,
                    cardIndex,
                    label: card.label,
                });
                return;
            }

            // If in target_select phase, use the pending card index
            const resolveIndex =
                room.gameState.phase === 'target_select' && room.gameState._pendingCardIndex !== undefined
                    ? room.gameState._pendingCardIndex
                    : cardIndex;

            const result = applyCardEffect(room, socket.id, resolveIndex, targetPlayerId);
            if (result.error) return cb({ success: false, error: result.error });

            delete room.gameState._pendingCardIndex;
            cb({ success: true, result });

            io.to(info.roomCode).emit('card_flipped', result);
            io.to(info.roomCode).emit('score_update', {
                players: room.players.map((p) => ({
                    id: p.id,
                    name: p.name,
                    score: p.score,
                })),
            });

            if (result.gameOver) {
                io.to(info.roomCode).emit('game_over', {
                    winner: result.winner,
                    players: room.players.map((p) => ({
                        id: p.id,
                        name: p.name,
                        score: p.score,
                    })),
                });
            } else {
                // Next question after a short delay
                setTimeout(() => {
                    room.gameState.phase = 'question';
                    sendQuestion(io, room);
                }, 2000);
            }
        });

        socket.on('select_target_player', ({ targetPlayerId }, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room || !room.gameState) return cb({ success: false, error: 'No active game' });
            if (room.gameState.phase !== 'target_select')
                return cb({ success: false, error: 'Not in target selection phase' });
            if (room.gameState.turnPlayerId !== socket.id)
                return cb({ success: false, error: 'Not your turn' });

            const cardIndex = room.gameState._pendingCardIndex;
            if (cardIndex === undefined) return cb({ success: false, error: 'No pending card' });

            const result = applyCardEffect(room, socket.id, cardIndex, targetPlayerId);
            if (result.error) return cb({ success: false, error: result.error });

            delete room.gameState._pendingCardIndex;
            cb({ success: true, result });

            io.to(info.roomCode).emit('card_flipped', result);
            io.to(info.roomCode).emit('score_update', {
                players: room.players.map((p) => ({
                    id: p.id,
                    name: p.name,
                    score: p.score,
                })),
            });

            if (result.gameOver) {
                io.to(info.roomCode).emit('game_over', {
                    winner: result.winner,
                    players: room.players.map((p) => ({
                        id: p.id,
                        name: p.name,
                        score: p.score,
                    })),
                });
            } else {
                setTimeout(() => {
                    room.gameState.phase = 'question';
                    sendQuestion(io, room);
                }, 2000);
            }
        });

        socket.on('restart_game', (_, callback) => {
            const info = socketMap.get(socket.id);
            const cb = callback || (() => { });
            if (!info) return cb({ success: false, error: 'Not in a room' });

            const room = getRoom(info.roomCode);
            if (!room) return cb({ success: false, error: 'Room not found' });
            if (room.hostId !== socket.id)
                return cb({ success: false, error: 'Only host can restart' });

            room.status = 'lobby';
            room.gameState = null;
            room.players.forEach((p) => {
                p.score = room.settings.startingPoints;
            });

            cb({ success: true });
            io.to(info.roomCode).emit('lobby_updated', sanitizeRoom(room));
        });

        // ─── DISCONNECT ───

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
            handleLeave(socket, io);
        });
    });
}

function handleLeave(socket, io) {
    const info = socketMap.get(socket.id);
    if (!info) return;

    const room = leaveRoom(info.roomCode, info.playerId);
    socketMap.delete(socket.id);
    socket.leave(info.roomCode);

    if (room) {
        io.to(info.roomCode).emit('lobby_updated', sanitizeRoom(room));
    }
}

function sendQuestion(io, room) {
    if (!room.gameState || room.status !== 'playing') return;

    const question = getNextQuestion(room);
    room.gameState.currentQuestion = question;
    room.gameState.answeredPlayers = new Set();
    room.gameState.turnPlayerId = null;
    room.gameState.phase = 'question';

    io.to(room.code).emit('trivia_question', {
        questionText: question.questionText,
        timeLimit: question.timeLimit,
    });

    // Auto-skip if nobody answers in time
    room.gameState.questionTimeout = setTimeout(() => {
        if (room.gameState && room.gameState.phase === 'question') {
            io.to(room.code).emit('answer_result', {
                correct: false,
                timeout: true,
                correctAnswer: question.correctAnswer,
            });
            // Send next question
            setTimeout(() => {
                sendQuestion(io, room);
            }, 2000);
        }
    }, (question.timeLimit + 1) * 1000);
}

module.exports = { registerHandlers };
