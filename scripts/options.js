// options.js
import { clubs } from './clubs.js';

function getOptions(gameState) {
    const position = gameState.position;
    const availableClubs = Object.keys(clubs).filter(club => {
        if (position === 'green') {
            return club === 'putter';
        }
        return club !== 'putter';
    });
    return availableClubs.map(club => ({
        id: club,
        text: club
    }));
}

export { getOptions };

