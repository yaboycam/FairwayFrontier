// situations.js

function getSituation(gameState) {
    const yardageToHole = gameState.yardage;
    const position = gameState.position;

    const description = `You are ${yardageToHole} yards from the hole on the ${position}. Choose your club.`;
    return {
        id: gameState.hole,
        description: description,
        position: position,
        type: 'golf'
    };
}

export { getSituation };
