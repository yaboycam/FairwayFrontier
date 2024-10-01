// events.js

const events = [
    {
        id: 'findBeer',
        description: 'You find a cold beer on the ground. Do you pick it up?',
        chance: 0.3, // 30% chance to occur
        trigger: 'postShot', // Occurs after a shot
        options: [
            {
                id: 'pickBeer',
                text: 'Yes, pick it up.',
                resultText: 'Smart, you looked thirsty.',
                effect: (gameState) => {
                    gameState.inventory.push('Beer');
                }
            },
            {
                id: 'leaveBeer',
                text: 'No, leave it.',
                resultText: 'Wow, you are a bitch, huh?',
                effect: (gameState) => {
                    // No effect on gameState
                }
            }
        ]
    },
    // Additional events can be added here
];

export { events };

