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
    { questionText: 'What is the capital of France?', correctAnswer: 'Paris' },
    { questionText: 'How many days are in a leap year?', correctAnswer: '366' },
    { questionText: 'What is the smallest prime number?', correctAnswer: '2' },
    { questionText: 'What does DNA stand for?', correctAnswer: 'Deoxyribonucleic acid' },
    { questionText: 'What is the largest desert in the world?', correctAnswer: 'Antarctic' },
    { questionText: 'Who invented the telephone?', correctAnswer: 'Alexander Graham Bell' },
    { questionText: 'What is the currency of the United Kingdom?', correctAnswer: 'Pound' },
    { questionText: 'How many strings does a standard guitar have?', correctAnswer: '6' },
    { questionText: 'What is the chemical symbol for silver?', correctAnswer: 'Ag' },
    { questionText: 'What year did World War I begin?', correctAnswer: '1914' },
    { questionText: 'How many teeth does an adult human have?', correctAnswer: '32' },
    { questionText: 'What is the fastest land animal?', correctAnswer: 'Cheetah' },
    { questionText: 'What planet is closest to the Sun?', correctAnswer: 'Mercury' },
    { questionText: 'Who painted the Sistine Chapel ceiling?', correctAnswer: 'Michelangelo' },
    { questionText: 'What is the largest island in the world?', correctAnswer: 'Greenland' },
    { questionText: 'How many sides does a triangle have?', correctAnswer: '3' },
    { questionText: 'What is the capital of Italy?', correctAnswer: 'Rome' },
    { questionText: 'What element has the atomic number 1?', correctAnswer: 'Hydrogen' },
    { questionText: 'How many degrees are in a circle?', correctAnswer: '360' },
    { questionText: 'What is the largest mammal on land?', correctAnswer: 'African elephant' },
    { questionText: 'What year did the Berlin Wall fall?', correctAnswer: '1989' },
    { questionText: 'What is the chemical formula for table salt?', correctAnswer: 'NaCl' },
    { questionText: 'How many legs does a spider have?', correctAnswer: '8' },
    { questionText: 'What is the capital of Spain?', correctAnswer: 'Madrid' },
    { questionText: 'Who wrote "To Kill a Mockingbird"?', correctAnswer: 'Harper Lee' },
    { questionText: 'What is the smallest ocean?', correctAnswer: 'Arctic' },
    { questionText: 'How many minutes are in an hour?', correctAnswer: '60' },
    { questionText: 'What planet has the most moons?', correctAnswer: 'Saturn' },
    { questionText: 'What is the currency of China?', correctAnswer: 'Yuan' },
    { questionText: 'Who discovered gravity?', correctAnswer: 'Isaac Newton' },
    { questionText: 'What is the capital of Germany?', correctAnswer: 'Berlin' },
    { questionText: 'How many zeros are in one million?', correctAnswer: '6' },
    { questionText: 'What is the largest continent?', correctAnswer: 'Asia' },
    { questionText: 'What year did Christopher Columbus reach the Americas?', correctAnswer: '1492' },
    { questionText: 'What is the chemical symbol for iron?', correctAnswer: 'Fe' },
    { questionText: 'How many eyes does a bee have?', correctAnswer: '5' },
    { questionText: 'What is the capital of Canada?', correctAnswer: 'Ottawa' },
    { questionText: 'Who invented the light bulb?', correctAnswer: 'Thomas Edison' },
    { questionText: 'What is the largest state in the USA by area?', correctAnswer: 'Alaska' },
    { questionText: 'How many hours are in a day?', correctAnswer: '24' },
    { questionText: 'What is the hottest planet in our solar system?', correctAnswer: 'Venus' },
    { questionText: 'What element does "N" represent on the periodic table?', correctAnswer: 'Nitrogen' },
    { questionText: 'How many legs does an insect have?', correctAnswer: '6' },
    { questionText: 'What is the capital of Russia?', correctAnswer: 'Moscow' },
    { questionText: 'Who was the first person to walk on the Moon?', correctAnswer: 'Neil Armstrong' },
    { questionText: 'What is the smallest bone in the human body?', correctAnswer: 'Stapes' },
    { questionText: 'How many seconds are in a minute?', correctAnswer: '60' },
    { questionText: 'What is the capital of Egypt?', correctAnswer: 'Cairo' },
    { questionText: 'What year did the American Civil War end?', correctAnswer: '1865' },
    { questionText: 'What is the chemical symbol for carbon?', correctAnswer: 'C' },
    { questionText: 'How many weeks are in a year?', correctAnswer: '52' },
    { questionText: 'What is the longest bone in the human body?', correctAnswer: 'Femur' },
    { questionText: 'Who painted "The Starry Night"?', correctAnswer: 'Van Gogh' },
    { questionText: 'What is the capital of Japan?', correctAnswer: 'Tokyo' },
    { questionText: 'How many chambers does the human heart have?', correctAnswer: '4' },
    { questionText: 'What is the largest country in the world by area?', correctAnswer: 'Russia' },
    { questionText: 'What element does "He" represent on the periodic table?', correctAnswer: 'Helium' },
    { questionText: 'How many months have 31 days?', correctAnswer: '7' },
    { questionText: 'What is the capital of Greece?', correctAnswer: 'Athens' },
    { questionText: 'What year did the French Revolution begin?', correctAnswer: '1789' },
    { questionText: 'What is the speed of sound in air (approximately in m/s)?', correctAnswer: '343' },
    { questionText: 'How many colors are in a rainbow?', correctAnswer: '7' },
    { questionText: 'What is the largest organ in the human body?', correctAnswer: 'Skin' }
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
