const { v4: uuidv4 } = require('uuid');

// In-memory room store
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function createRoom(hostId, hostName, settings = {}) {
  const code = generateRoomCode();
  const room = {
    code,
    hostId,
    status: 'lobby', // lobby | playing | finished
    players: [
      {
        id: hostId,
        name: hostName,
        score: settings.startingPoints || 1000,
        connected: true,
      },
    ],
    settings: {
      startingPoints: settings.startingPoints || 1000,
      maxPlayers: settings.maxPlayers || 12,
      triviaTimer: settings.triviaTimer || 15,
      animationsEnabled: settings.animationsEnabled !== false,
    },
    trivia: [],
    gameState: null,
  };
  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function joinRoom(code, playerId, playerName) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.status !== 'lobby') return { error: 'Game already in progress' };
  if (room.players.length >= room.settings.maxPlayers)
    return { error: 'Room is full' };

  const existing = room.players.find((p) => p.id === playerId);
  if (existing) {
    existing.connected = true;
    existing.name = playerName;
    return { room };
  }

  room.players.push({
    id: playerId,
    name: playerName,
    score: room.settings.startingPoints,
    connected: true,
  });
  return { room };
}

function leaveRoom(code, playerId) {
  const room = rooms.get(code);
  if (!room) return null;

  if (room.status === 'lobby') {
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      rooms.delete(code);
      return null;
    }
    // Transfer host if host left
    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }
  } else {
    // During a game, mark as disconnected
    const player = room.players.find((p) => p.id === playerId);
    if (player) player.connected = false;
  }
  return room;
}

function removeRoom(code) {
  rooms.delete(code);
}

function kickPlayer(code, hostId, targetId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.hostId !== hostId) return { error: 'Only host can kick players' };
  if (hostId === targetId) return { error: 'Cannot kick yourself' };

  room.players = room.players.filter((p) => p.id !== targetId);
  return { room };
}

function updateSettings(code, hostId, newSettings) {
  const room = rooms.get(code);
  if (!room) return { error: 'Room not found' };
  if (room.hostId !== hostId) return { error: 'Only host can change settings' };
  if (room.status !== 'lobby') return { error: 'Cannot change settings during game' };

  room.settings = { ...room.settings, ...newSettings };
  return { room };
}

function sanitizeRoom(room) {
  if (!room) return null;
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      connected: p.connected,
    })),
    settings: room.settings,
    trivia: room.trivia,
    gameState: room.gameState
      ? {
          board: room.gameState.board.map((card) => ({
            flipped: card.flipped,
            type: card.flipped ? card.type : null,
            value: card.flipped ? card.value : null,
            label: card.flipped ? card.label : null,
          })),
          currentQuestion: room.gameState.currentQuestion
            ? {
                questionText: room.gameState.currentQuestion.questionText,
                timeLimit: room.gameState.currentQuestion.timeLimit,
              }
            : null,
          turnPlayerId: room.gameState.turnPlayerId,
          phase: room.gameState.phase,
          cardsRemaining: room.gameState.board.filter((c) => !c.flipped).length,
          activeModifier: room.gameState.activeModifier,
          questionIndex: room.gameState.questionIndex,
        }
      : null,
  };
}

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  removeRoom,
  kickPlayer,
  updateSettings,
  sanitizeRoom,
};
