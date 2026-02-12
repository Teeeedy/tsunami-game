/**
 * TSUNAMI Trivia System
 * Handles custom trivia CRUD and default question bank.
 */

const defaultQuestions = [
    { questionText: 'What is the largest planet in our solar system?', correctAnswer: 'Jupiter' },
    { questionText: 'What year did the Titanic sink?', correctAnswer: '1912' },
    { questionText: 'What is the chemical symbol for gold?', correctAnswer: 'Au' },
    { questionText: 'How many bones are in the adult human body?', correctAnswer: '206' },
    { questionText: 'What is the capital of Australia?', correctAnswer: 'Canberra' },
    { questionText: 'Who painted the Mona Lisa?', correctAnswer: 'Leonardo da Vinci' },
    { questionText: 'What is the smallest country in the world?', correctAnswer: 'Vatican City' },
    { questionText: 'What element does "O" represent on the periodic table?', correctAnswer: 'Oxygen' },
    { questionText: 'In what year did World War II end?', correctAnswer: '1945' },
    { questionText: 'What is the hardest natural substance on Earth?', correctAnswer: 'Diamond' },
    { questionText: 'How many continents are there?', correctAnswer: '7' },
    { questionText: 'What planet is known as the Red Planet?', correctAnswer: 'Mars' },
    { questionText: 'What is the longest river in the world?', correctAnswer: 'Nile' },
    { questionText: 'Who wrote Romeo and Juliet?', correctAnswer: 'Shakespeare' },
    { questionText: 'What is the speed of light in km/s (rounded)?', correctAnswer: '300000' },
    { questionText: 'What gas do plants absorb from the atmosphere?', correctAnswer: 'Carbon dioxide' },
    { questionText: 'What is the largest ocean on Earth?', correctAnswer: 'Pacific' },
    { questionText: 'How many players are on a soccer team?', correctAnswer: '11' },
    { questionText: 'What is the freezing point of water in Celsius?', correctAnswer: '0' },
    { questionText: 'Who discovered penicillin?', correctAnswer: 'Alexander Fleming' },
    { questionText: 'What is the tallest mountain in the world?', correctAnswer: 'Everest' },
    { questionText: 'How many sides does a hexagon have?', correctAnswer: '6' },
    { questionText: 'What country has the most people?', correctAnswer: 'India' },
    { questionText: 'What is the currency of Japan?', correctAnswer: 'Yen' },
    { questionText: 'What animal is the largest living mammal?', correctAnswer: 'Blue whale' },
    { questionText: 'What is H2O commonly known as?', correctAnswer: 'Water' },
    { questionText: 'What year did humans first land on the Moon?', correctAnswer: '1969' },
    { questionText: 'What is the main language spoken in Brazil?', correctAnswer: 'Portuguese' },
    { questionText: 'How many letters are in the English alphabet?', correctAnswer: '26' },
    { questionText: 'What does CPU stand for?', correctAnswer: 'Central Processing Unit' },
    { questionText: 'What color do you get mixing red and blue?', correctAnswer: 'Purple' },
    { questionText: 'What is the square root of 144?', correctAnswer: '12' },
    { questionText: 'What is the boiling point of water in Celsius?', correctAnswer: '100' },
    { questionText: 'Who was the first president of the United States?', correctAnswer: 'George Washington' },
    { questionText: 'What organ pumps blood through the body?', correctAnswer: 'Heart' },
];

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get the question pool for a room. Uses custom trivia if available, else defaults.
 */
function getQuestionPool(room) {
    const custom = room.trivia && room.trivia.length > 0 ? room.trivia : [];
    const pool = custom.length >= 25 ? custom : [...custom, ...defaultQuestions];
    return shuffleArray(pool);
}

/**
 * Get the next trivia question for a room.
 * Initializes the shuffled pool on first call.
 */
function getNextQuestion(room) {
    const gs = room.gameState;
    if (!gs._questionPool) {
        gs._questionPool = getQuestionPool(room);
    }

    const idx = gs.questionIndex;
    if (idx >= gs._questionPool.length) {
        // Reshuffle if we exhaust all questions
        gs._questionPool = getQuestionPool(room);
        gs.questionIndex = 0;
    }

    const question = gs._questionPool[gs.questionIndex];
    gs.questionIndex++;

    return {
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        timeLimit: question.timeLimit || room.settings.triviaTimer || 15,
    };
}

/**
 * Check if a submitted answer is correct (case-insensitive, trimmed)
 */
function checkAnswer(correctAnswer, submittedAnswer) {
    if (!submittedAnswer || !correctAnswer) return false;
    return (
        correctAnswer.trim().toLowerCase() === submittedAnswer.trim().toLowerCase()
    );
}

/**
 * CRUD for custom trivia
 */
function addTrivia(room, hostId, question) {
    if (room.hostId !== hostId) return { error: 'Only host can manage trivia' };
    if (!question.questionText || !question.correctAnswer)
        return { error: 'Question text and correct answer are required' };

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const triviaItem = {
        id,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        timeLimit: question.timeLimit || null,
    };
    room.trivia.push(triviaItem);
    return { trivia: room.trivia };
}

function editTrivia(room, hostId, triviaId, updates) {
    if (room.hostId !== hostId) return { error: 'Only host can manage trivia' };
    const item = room.trivia.find((t) => t.id === triviaId);
    if (!item) return { error: 'Trivia question not found' };

    if (updates.questionText) item.questionText = updates.questionText;
    if (updates.correctAnswer) item.correctAnswer = updates.correctAnswer;
    if (updates.timeLimit !== undefined) item.timeLimit = updates.timeLimit;

    return { trivia: room.trivia };
}

function deleteTrivia(room, hostId, triviaId) {
    if (room.hostId !== hostId) return { error: 'Only host can manage trivia' };
    room.trivia = room.trivia.filter((t) => t.id !== triviaId);
    return { trivia: room.trivia };
}

module.exports = {
    getNextQuestion,
    checkAnswer,
    addTrivia,
    editTrivia,
    deleteTrivia,
    defaultQuestions,
};
