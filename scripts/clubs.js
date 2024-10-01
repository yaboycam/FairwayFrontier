// clubs.js

const clubs = {
    driver: { averageDistance: 230 },
    '3 wood': { averageDistance: 210 },
    '5 wood': { averageDistance: 195 },
    '5 iron': { averageDistance: 180 },
    '6 iron': { averageDistance: 170 },
    '7 iron': { averageDistance: 160 },
    '8 iron': { averageDistance: 150 },
    '9 iron': { averageDistance: 140 },
    'pitching wedge': { averageDistance: 130 },
    'sand wedge': { averageDistance: 80 },
    'lob wedge': { averageDistance: 50 },
    putter: { averageDistance: 10 }
};

const terrainModifiers = {
    fairway: 1.0,
    rough: 0.8,
    sand: 0.5,
    green: 1.0,
    water: 0.0,
    'tee box': 1.0
};

function calculateShotDistance(club, terrain, power) {
    if (clubs[club] && terrainModifiers[terrain] !== undefined) {
        const baseDistance = clubs[club].averageDistance;
        const modifier = terrainModifiers[terrain];
        const shotDistance = baseDistance * modifier * power;
        return Math.round(shotDistance);
    } else {
        console.error(`Invalid club (${club}) or terrain (${terrain})`);
        return 0; // Return 0 to avoid NaN
    }
}

export { clubs, calculateShotDistance };
