/**
 * TSUNAMI Game Logic
 * Handles deck generation, card effects, and score mutations.
 */

function generateDeck() {
    const cards = [
        // Positive Cards (16)
        { type: 'gain', value: 50, label: '+50' },
        { type: 'gain', value: 50, label: '+50' },
        { type: 'gain', value: 100, label: '+100' },
        { type: 'gain', value: 100, label: '+100' },
        { type: 'gain', value: 100, label: '+100' },
        { type: 'gain', value: 200, label: '+200' },
        { type: 'gain', value: 200, label: '+200' },
        { type: 'gain', value: 200, label: '+200' },
        { type: 'gain', value: 300, label: '+300' },
        { type: 'gain', value: 300, label: '+300' },
        { type: 'gain', value: 300, label: '+300' },
        { type: 'gain', value: 400, label: '+400' },
        { type: 'gain', value: 400, label: '+400' },
        { type: 'gain', value: 400, label: '+400' },
        { type: 'gain', value: 500, label: '+500' },
        { type: 'gain', value: 500, label: '+500' },
        // Negative Cards (9)
        { type: 'lose', value: 50, label: '-50' },
        { type: 'lose', value: 50, label: '-50' },
        { type: 'lose', value: 100, label: '-100' },
        { type: 'lose', value: 100, label: '-100' },
        { type: 'lose', value: 200, label: '-200' },
        { type: 'lose', value: 200, label: '-200' },
        { type: 'lose', value: 200, label: '-200' },
        { type: 'lose', value: 300, label: '-300' },
        { type: 'lose', value: 400, label: '-400' },
        // Interaction Cards (10)
        { type: 'steal', value: 100, label: 'Steal 100' },
        { type: 'steal', value: 100, label: 'Steal 100' },
        { type: 'steal', value: 200, label: 'Steal 200' },
        { type: 'steal', value: 200, label: 'Steal 200' },
        { type: 'steal', value: 300, label: 'Steal 300' },
        { type: 'give', value: 100, label: 'Give 100' },
        { type: 'give', value: 100, label: 'Give 100' },
        { type: 'give', value: 200, label: 'Give 200' },
        { type: 'give', value: 200, label: 'Give 200' },
        { type: 'give', value: 300, label: 'Give 300' },
        // Modifier Cards (7)
        { type: 'double', value: 0, label: 'DOUBLE' },
        { type: 'double', value: 0, label: 'DOUBLE' },
        { type: 'double', value: 0, label: 'DOUBLE' },
        { type: 'double', value: 0, label: 'DOUBLE' },
        { type: 'reverse', value: 0, label: 'REVERSE' },
        { type: 'reverse', value: 0, label: 'REVERSE' },
        { type: 'reverse', value: 0, label: 'REVERSE' },
        // Rare Cards (7)
        { type: 'tsunami', value: 0, label: 'TSUNAMI' },
        { type: 'tsunami', value: 0, label: 'TSUNAMI' },
        { type: 'tsunami', value: 0, label: 'TSUNAMI' },
        { type: 'swap', value: 0, label: 'SWAP' },
        { type: 'swap', value: 0, label: 'SWAP' },
        { type: 'swap', value: 0, label: 'SWAP' },
        { type: 'swap', value: 0, label: 'SWAP' },
    ];

    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards.map((card) => ({ ...card, flipped: false }));
}

function initGameState(room) {
    const board = generateDeck();
    room.gameState = {
        board,
        currentQuestion: null,
        turnPlayerId: null,
        phase: 'question', // question | picking | resolving | target_select
        activeModifier: null, // 'double' | 'reverse' | null
        questionIndex: 0,
        answeredPlayers: new Set(),
        questionTimeout: null,
        streaks: {}, // playerId -> consecutive correct answer count
        questionStartTime: null, // timestamp when question was sent
    };
    // Reset all player scores
    room.players.forEach((p) => {
        p.score = room.settings.startingPoints;
    });
    room.status = 'playing';
}

/**
 * Apply a card effect when a player picks a card.
 * Returns a result describing what happened.
 */
function applyCardEffect(room, playerId, cardIndex, targetPlayerId) {
    const gs = room.gameState;
    const card = gs.board[cardIndex];

    if (!card || card.flipped) {
        return { error: 'Invalid card selection' };
    }

    card.flipped = true;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { error: 'Player not found' };

    const modifier = gs.activeModifier;
    let result = {
        cardIndex,
        card: { type: card.type, value: card.value, label: card.label },
        playerId,
        playerName: player.name,
        modifier,
        effects: [],
        gameOver: false,
    };

    switch (card.type) {
        case 'gain': {
            let amount = card.value;
            if (modifier === 'double') amount *= 2;
            if (modifier === 'reverse') {
                // Gain becomes lose
                player.score -= amount;
                result.effects.push({
                    type: 'lose',
                    playerId,
                    playerName: player.name,
                    amount,
                    description: `${player.name} loses ${amount} (reversed gain)`,
                });
            } else {
                player.score += amount;
                result.effects.push({
                    type: 'gain',
                    playerId,
                    playerName: player.name,
                    amount,
                    description: `${player.name} gains ${amount}${modifier === 'double' ? ' (doubled!)' : ''}`,
                });
            }
            gs.activeModifier = null;
            break;
        }

        case 'lose': {
            let amount = card.value;
            if (modifier === 'double') amount *= 2;
            if (modifier === 'reverse') {
                // Lose becomes gain
                player.score += amount;
                result.effects.push({
                    type: 'gain',
                    playerId,
                    playerName: player.name,
                    amount,
                    description: `${player.name} gains ${amount} (reversed loss!)`,
                });
            } else {
                player.score -= amount;
                result.effects.push({
                    type: 'lose',
                    playerId,
                    playerName: player.name,
                    amount,
                    description: `${player.name} loses ${amount}${modifier === 'double' ? ' (doubled!)' : ''}`,
                });
            }
            gs.activeModifier = null;
            break;
        }

        case 'steal': {
            const target = room.players.find((p) => p.id === targetPlayerId);
            if (!target) return { error: 'Target player not found' };
            let amount = card.value;
            if (modifier === 'double') amount *= 2;
            if (modifier === 'reverse') {
                // Steal becomes give
                player.score -= amount;
                target.score += amount;
                result.effects.push({
                    type: 'give',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount,
                    description: `${player.name} gives ${amount} to ${target.name} (reversed steal!)`,
                });
            } else {
                const actualSteal = Math.min(amount, target.score);
                target.score -= actualSteal;
                player.score += actualSteal;
                result.effects.push({
                    type: 'steal',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount: actualSteal,
                    description: `${player.name} steals ${actualSteal} from ${target.name}${modifier === 'double' ? ' (doubled!)' : ''}`,
                });
            }
            gs.activeModifier = null;
            break;
        }

        case 'give': {
            const target = room.players.find((p) => p.id === targetPlayerId);
            if (!target) return { error: 'Target player not found' };
            let amount = card.value;
            if (modifier === 'double') amount *= 2;
            if (modifier === 'reverse') {
                // Reverse: give becomes steal
                const actualSteal = Math.min(amount, target.score);
                target.score -= actualSteal;
                player.score += actualSteal;
                result.effects.push({
                    type: 'steal',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount: actualSteal,
                    description: `${player.name} steals ${actualSteal} from ${target.name} (reversed give!)`,
                });
            } else {
                player.score -= amount;
                target.score += amount;
                result.effects.push({
                    type: 'give',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount,
                    description: `${player.name} gives ${amount} to ${target.name}${modifier === 'double' ? ' (doubled!)' : ''}`,
                });
            }
            gs.activeModifier = null;
            break;
        }

        case 'double': {
            gs.activeModifier = 'double';
            result.effects.push({
                type: 'modifier',
                description: `${player.name} activated DOUBLE! Next card effect will be doubled!`,
            });
            break;
        }

        case 'reverse': {
            gs.activeModifier = 'reverse';
            result.effects.push({
                type: 'modifier',
                description: `${player.name} activated REVERSE! Next card effect will be reversed!`,
            });
            break;
        }

        case 'tsunami': {
            const target = room.players.find((p) => p.id === targetPlayerId);
            if (!target) return { error: 'Target player not found' };
            if (modifier === 'double') {
                // Double the effect: quarter points? No, per spec double = doubled impact
                const halved = Math.floor(target.score / 2);
                target.score -= halved;
                result.effects.push({
                    type: 'tsunami',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount: halved,
                    description: `TSUNAMI! ${target.name} loses ${halved} points (halved, doubled impact)!`,
                });
            } else if (modifier === 'reverse') {
                // Reverse: double target's points instead of halving
                const bonus = target.score;
                target.score += bonus;
                result.effects.push({
                    type: 'tsunami_reversed',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount: bonus,
                    description: `REVERSED TSUNAMI! ${target.name}'s points doubled to ${target.score}!`,
                });
            } else {
                const halved = Math.floor(target.score / 2);
                target.score -= halved;
                result.effects.push({
                    type: 'tsunami',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    amount: halved,
                    description: `TSUNAMI! ${target.name} loses half their points (-${halved})!`,
                });
            }
            gs.activeModifier = null;
            break;
        }

        case 'swap': {
            const target = room.players.find((p) => p.id === targetPlayerId);
            if (!target) return { error: 'Target player not found' };
            if (modifier === 'reverse') {
                // Swap is cancelled
                result.effects.push({
                    type: 'swap_cancelled',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    description: `SWAP was REVERSED and cancelled! No swap occurs.`,
                });
            } else {
                const temp = player.score;
                player.score = target.score;
                target.score = temp;
                result.effects.push({
                    type: 'swap',
                    playerId,
                    playerName: player.name,
                    targetId: targetPlayerId,
                    targetName: target.name,
                    description: `${player.name} swapped scores with ${target.name}!${modifier === 'double' ? ' (Double had no extra effect on swap)' : ''}`,
                });
            }
            gs.activeModifier = null;
            break;
        }

        default:
            return { error: 'Unknown card type' };
    }

    // Check if game is over
    const cardsRemaining = gs.board.filter((c) => !c.flipped).length;
    if (cardsRemaining === 0) {
        room.status = 'finished';
        gs.phase = 'finished';
        result.gameOver = true;
        result.winner = [...room.players].sort((a, b) => b.score - a.score)[0];
    }

    return result;
}

/**
 * Check if a card type requires target selection
 */
function cardRequiresTarget(cardType) {
    return ['steal', 'tsunami', 'swap', 'give'].includes(cardType);
}

module.exports = {
    generateDeck,
    initGameState,
    applyCardEffect,
    cardRequiresTarget,
};
