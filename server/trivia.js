/**
 * TSUNAMI Trivia System
 * Handles custom trivia CRUD and default question bank.
 */

const defaultQuestions = [
    { questionText: 'What food group does cereal technically belong to, despite what everyone calls it for dinner?', correctAnswer: 'Breakfast' },
    { questionText: 'What is the chemical symbol for gold?', correctAnswer: 'Au' },
    { questionText: 'What dating app turns swiping into a part-time job with zero pay?', correctAnswer: 'Tinder' },
    { questionText: 'How many bones are in the adult human body?', correctAnswer: '206' },
    { questionText: 'What fast food item has caused more 2am arguments than politics?', correctAnswer: 'McNuggets sauce' },
    { questionText: 'What planet looks red because of rusty iron dust on its surface?', correctAnswer: 'Mars' },
    { questionText: 'What streaming service phrase is basically a guilt trip disguised as a question?', correctAnswer: 'Are you still watching?' },
    { questionText: 'What element does "O" represent on the periodic table?', correctAnswer: 'Oxygen' },
    { questionText: 'What coffee order makes baristas internally sigh the moment you start talking?', correctAnswer: 'Venti half-caf soy latte' },
    { questionText: 'What is the hardest natural substance on Earth?', correctAnswer: 'Diamond' },
    { questionText: 'What video call platform turned "you\'re on mute" into a national catchphrase?', correctAnswer: 'Zoom' },
    { questionText: 'What is the chemical formula for table salt?', correctAnswer: 'NaCl' },
    { questionText: 'What leafy green do people add to smoothies purely for bragging rights?', correctAnswer: 'Kale' },
    { questionText: 'What gas do plants absorb from the atmosphere?', correctAnswer: 'Carbon dioxide' },
    { questionText: 'What app feature gives you 24 hours to overshare before deleting the evidence?', correctAnswer: 'Instagram Stories' },
    { questionText: 'What force keeps your coffee in the cup and not floating into orbit?', correctAnswer: 'Gravity' },
    { questionText: 'Who discovered penicillin, basically by accidentally leaving food out too long?', correctAnswer: 'Alexander Fleming' },
    { questionText: 'What is the unit used to measure electrical current?', correctAnswer: 'Ampere' },
    { questionText: 'How many sides does a hexagon have?', correctAnswer: '6' },
    { questionText: 'What ride-share app makes you panic-clean your car for a stranger\'s rating?', correctAnswer: 'Uber' },
    { questionText: 'What is the currency of Japan?', correctAnswer: 'Yen' },
    { questionText: 'What particle has a negative charge and orbits the nucleus of an atom?', correctAnswer: 'Electron' },
    { questionText: 'What is H2O commonly known as?', correctAnswer: 'Water' },
    { questionText: 'What delivery app fee makes a $12 burger somehow cost $25?', correctAnswer: 'UberEats' },
    { questionText: 'What is the term for the gas state changing directly into a solid without becoming liquid?', correctAnswer: 'Deposition' },
    { questionText: 'What gym day do even the laziest people show up for, no excuses?', correctAnswer: 'Leg day' },
    { questionText: 'What color do you get mixing red and blue?', correctAnswer: 'Purple' },
    { questionText: 'What is the square root of 144?', correctAnswer: '12' },
    { questionText: 'What is the boiling point of water in Celsius?', correctAnswer: '100' },
    { questionText: 'What organ pumps blood through the body?', correctAnswer: 'Heart' },
    { questionText: 'What part of the brain is responsible for balance and coordination?', correctAnswer: 'Cerebellum' },
    { questionText: 'What is the smallest prime number?', correctAnswer: '2' },
    { questionText: 'What does DNA stand for?', correctAnswer: 'Deoxyribonucleic acid' },
    { questionText: 'What social app turned doing literally nothing into a full-blown career path?', correctAnswer: 'TikTok' },
    { questionText: 'What is the currency of the United Kingdom?', correctAnswer: 'Pound' },
    { questionText: 'What process do plants use to convert sunlight into energy?', correctAnswer: 'Photosynthesis' },
    { questionText: 'What is the chemical symbol for silver?', correctAnswer: 'Ag' },
    { questionText: 'What term describes scrolling your phone for hours absorbing nothing but bad news?', correctAnswer: 'Doomscrolling' },
    { questionText: 'What scientific law states every action has an equal and opposite reaction?', correctAnswer: 'Newton\'s third law' },
    { questionText: 'What is the most abundant gas in Earth\'s atmosphere?', correctAnswer: 'Nitrogen' },
    { questionText: 'What planet is closest to the Sun?', correctAnswer: 'Mercury' },
    { questionText: 'What meal kit subscription makes you feel like a chef for exactly one night a week?', correctAnswer: 'HelloFresh' },
    { questionText: 'What is the basic unit of life, the building block of all living organisms?', correctAnswer: 'Cell' },
    { questionText: 'What element has the atomic number 1?', correctAnswer: 'Hydrogen' },
    { questionText: 'What force is responsible for objects falling toward the Earth?', correctAnswer: 'Gravity' },
    { questionText: 'What scientific term describes the resistance of an object to a change in its motion?', correctAnswer: 'Inertia' },
    { questionText: 'What buy-now-pay-later app turns four easy payments into long-term financial denial?', correctAnswer: 'Afterpay' },
    { questionText: 'What part of a cell contains its genetic material?', correctAnswer: 'Nucleus' },
    { questionText: 'What overpriced home gym equipment becomes a clothes rack within a month?', correctAnswer: 'Treadmill' },
    { questionText: 'What is the speed of light in a vacuum (approximately, in km/s)?', correctAnswer: '300000' },
    { questionText: 'What planet has the most moons?', correctAnswer: 'Saturn' },
    { questionText: 'What is the currency of China?', correctAnswer: 'Yuan' },
    { questionText: 'Who discovered gravity after allegedly getting hit on the head by an apple?', correctAnswer: 'Isaac Newton' },
    { questionText: 'What is the chemical symbol for sodium?', correctAnswer: 'Na' },
    { questionText: 'What is the term for an organism\'s complete set of genetic material?', correctAnswer: 'Genome' },
    { questionText: 'What is the chemical symbol for iron?', correctAnswer: 'Fe' },
    { questionText: 'What is the powerhouse of the cell, responsible for producing energy?', correctAnswer: 'Mitochondria' },
    { questionText: 'What scientific scale is used to measure the acidity or alkalinity of a substance?', correctAnswer: 'pH scale' },
    { questionText: 'How many hours are in a day?', correctAnswer: '24' },
    { questionText: 'What is the hottest planet in our solar system, despite not being closest to the Sun?', correctAnswer: 'Venus' },
    { questionText: 'What element does "N" represent on the periodic table?', correctAnswer: 'Nitrogen' },
    { questionText: 'What is the term for a substance that speeds up a chemical reaction without being consumed?', correctAnswer: 'Catalyst' },
    { questionText: 'What is the smallest bone in the human body?', correctAnswer: 'Stapes' },
    { questionText: 'What force holds the nucleus of an atom together despite proton repulsion?', correctAnswer: 'Strong nuclear force' },
    { questionText: 'What is the chemical symbol for carbon?', correctAnswer: 'C' },
    { questionText: 'What is the term for the bending of light as it passes through different mediums?', correctAnswer: 'Refraction' },
    { questionText: 'What is the longest bone in the human body?', correctAnswer: 'Femur' },
    { questionText: 'How many chambers does the human heart have?', correctAnswer: '4' },
    { questionText: 'What element does "He" represent on the periodic table?', correctAnswer: 'Helium' },
    { questionText: 'What is the speed of sound in air (approximately in m/s)?', correctAnswer: '343' },
    { questionText: 'What is the term for the study of weather and atmospheric conditions?', correctAnswer: 'Meteorology' },
    { questionText: 'What is the largest organ in the human body?', correctAnswer: 'Skin' },
    { questionText: 'What workplace messaging app turns a "quick question" into a 3-hour thread with 12 reaction emojis?', correctAnswer: 'Slack' },
    { questionText: 'What is the term for energy that is stored due to an object\'s position?', correctAnswer: 'Potential energy' },
    { questionText: 'What is the boiling point of water in Fahrenheit?', correctAnswer: '212' },
    { questionText: 'What brunch trend involves charging $18 for mashed avocado on toast?', correctAnswer: 'Avocado toast' }
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
