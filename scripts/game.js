// game.js
import { getSituation } from './situations.js';
import { getOptions } from './options.js';
import { calculateShotDistance, clubs } from './clubs.js';
import { courses } from './courses.js';

// Initializing the game state
let gameState = {
    hole: 1,
    strokes: 0,
    totalStrokes: 0,
    distanceTraveled: 0,
    yardage: courses.course1[0].holeLocation,
    position: 'tee box',
    lastValidPosition: { distanceTraveled: 0, yardage: courses.course1[0].holeLocation, position: 'tee box' },
    stats: {
        health: 100,
        alcohol: 0,
        weed: 0,
        balls: 10,
        confidence: 50
    },
    result: ''
};

// Starting the game and rendering the initial situation
function startGame() {
    renderCourseRepresentation();
    renderClubDistances();
    renderSituation();

    // Add event listener for the power slider
    const powerSlider = document.getElementById('power-slider');
    const powerValue = document.getElementById('power-value');
    powerSlider.addEventListener('input', () => {
        powerValue.textContent = `${powerSlider.value}%`;
    });
}

// Rendering the course representation based on the current hole
function renderCourseRepresentation() {
    const courseRepresentation = document.getElementById('course-representation');
    courseRepresentation.innerHTML = ''; // Clear existing segments

    const currentHoleLayout = courses.course1[gameState.hole - 1].layout;
    const totalYardage = currentHoleLayout[currentHoleLayout.length - 1].end;

    currentHoleLayout.forEach(segment => {
        const segmentElement = document.createElement('div');
        segmentElement.className = `segment ${segment.type.replace(' ', '')}`;
        segmentElement.style.width = `${((segment.end - segment.start) / totalYardage) * 100}%`;
        courseRepresentation.appendChild(segmentElement);
    });

    // Adding the hole segment
    const holeElement = document.createElement('div');
    holeElement.className = 'segment hole';
    holeElement.style.width = '1%'; // Make the hole segment more visible
    holeElement.style.left = `${(courses.course1[gameState.hole - 1].holeLocation / totalYardage) * 100}%`;
    courseRepresentation.appendChild(holeElement);

    // Adding the ball position segment
    const ballElement = document.createElement('div');
    ballElement.className = 'segment ball';
    ballElement.style.width = '1%'; // Make the ball segment more visible
    ballElement.style.left = `${(gameState.distanceTraveled / totalYardage) * 100}%`; // Positioning the ball
    courseRepresentation.appendChild(ballElement);
}

// Rendering the club distances based on the clubs.js file
function renderClubDistances() {
    const clubInfoColumn1 = document.getElementById('club-column-1');
    const clubInfoColumn2 = document.getElementById('club-column-2');
    clubInfoColumn1.innerHTML = ''; // Clear existing clubs
    clubInfoColumn2.innerHTML = ''; // Clear existing clubs

    const clubAbbreviations = {
        driver: 'D',
        '3 wood': '3W',
        '5 wood': '5W',
        '5 iron': '5I',
        '6 iron': '6I',
        '7 iron': '7I',
        '8 iron': '8I',
        '9 iron': '9I',
        'pitching wedge': 'PW',
        'sand wedge': 'SW',
        'lob wedge': 'LW',
        putter: 'P'
    };

    const clubKeys = Object.keys(clubs);
    const halfwayIndex = Math.ceil(clubKeys.length / 2);

    clubKeys.slice(0, halfwayIndex).forEach(club => {
        const clubElement = document.createElement('p');
        clubElement.textContent = `${clubAbbreviations[club]}: ${clubs[club].averageDistance}y`;
        clubInfoColumn1.appendChild(clubElement);
    });

    clubKeys.slice(halfwayIndex).forEach(club => {
        const clubElement = document.createElement('p');
        clubElement.textContent = `${clubAbbreviations[club]}: ${clubs[club].averageDistance}y`;
        clubInfoColumn2.appendChild(clubElement);
    });
}

// Rendering the current situation based on the game state
function renderSituation() {
    const situation = getSituation(gameState);
    document.getElementById('situation-text').innerHTML = situation.description;
    document.getElementById('result-text').innerHTML = gameState.result; // Display result text

    const options = getOptions(situation);
    renderOptions(options);
}

// Rendering the options available to the player
function renderOptions(options) {
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = ''; // Clear existing options
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text; // Update button text with club name
        button.className = 'option-button';
        button.addEventListener('click', () => handleOptionClick(option));
        optionsContainer.appendChild(button);
    });
}

// Handling the player's choice and updating the game state accordingly
function handleOptionClick(option) {
    const terrain = gameState.position;
    const powerSlider = document.getElementById('power-slider');
    const power = powerSlider.value / 100;
    const holeLocation = courses.course1[gameState.hole - 1].holeLocation;

    // Calculate shotDistance
    let shotDistance = calculateShotDistance(option.id, terrain, power);

    // Increment strokes
    gameState.strokes += 1;
    gameState.totalStrokes += 1;

    let direction = 1; // 1 for towards the hole, -1 for away from the hole

    if (gameState.distanceTraveled > holeLocation) {
        // Ball is past the hole, direction is back towards the hole
        direction = -1;
    }

    // Handle putting mechanics separately
    if (option.id === 'putter') {
        // Determine the edge of the green in the direction of the hole
        const greenEdges = getGreenEdges(gameState.hole);
        let greenEdgeDistance;

        if (direction === 1) {
            // Moving towards the hole
            greenEdgeDistance = greenEdges.end;
        } else {
            // Moving back towards the hole
            greenEdgeDistance = greenEdges.start;
        }

        // Calculate maximum possible shot distance without leaving the green
        const maxPossibleDistance = Math.abs(greenEdgeDistance - gameState.distanceTraveled);

        // Adjust shot distance if it would take the ball off the green
        if (shotDistance > maxPossibleDistance) {
            shotDistance = maxPossibleDistance;
        }

        // Putting mechanics with probability
        const success = calculatePuttSuccess(gameState.yardage);
        if (success) {
            gameState.distanceTraveled = holeLocation; // Ball is in the hole
            gameState.yardage = 0;
            gameState.result = `You sink the putt from ${Math.round(gameState.yardage)} yards!`;
            endHole();
        } else {
            // Simulate the ball stopping short or going slightly past but staying on the green
            const missDistance = getRandomInt(1, Math.min(3, gameState.yardage));
            gameState.distanceTraveled += direction * (shotDistance - missDistance);
            gameState.yardage = Math.abs(holeLocation - gameState.distanceTraveled);
            gameState.position = 'green';
            gameState.result = `You missed the putt. You're now ${Math.round(gameState.yardage)} yards from the hole.`;
            gameState.lastValidPosition = { distanceTraveled: gameState.distanceTraveled, yardage: gameState.yardage, position: gameState.position };
        }
    } else {
        // For other clubs
        gameState.distanceTraveled += direction * shotDistance;

        // Ensure distanceTraveled is within course bounds
        if (gameState.distanceTraveled < 0) {
            gameState.distanceTraveled = 0;
        }

        // Update yardage
        gameState.yardage = Math.abs(holeLocation - gameState.distanceTraveled);

        // Determine new terrain
        const newTerrain = getCurrentPosition(gameState.distanceTraveled, gameState.hole);

        // Check for out of bounds (more than 50 yards past the hole)
        if (gameState.distanceTraveled > holeLocation + 50) {
            // Ball is out of bounds
            gameState.strokes += 1; // Penalty stroke
            gameState.totalStrokes += 1;
            gameState.stats.balls -= 1; // Lose a ball

            // Reset to last valid position
            gameState.distanceTraveled = gameState.lastValidPosition.distanceTraveled;
            gameState.yardage = gameState.lastValidPosition.yardage;
            gameState.position = gameState.lastValidPosition.position;

            gameState.result = `You hit your ${option.id} out of bounds. You incur a penalty stroke and must replay from your last valid position.`;
        } else if (newTerrain === 'water') {
            // Increment strokes for dropping the ball
            gameState.strokes += 1;
            gameState.totalStrokes += 1;

            // Reset the ball position to the last valid position
            gameState.distanceTraveled = gameState.lastValidPosition.distanceTraveled;
            gameState.yardage = gameState.lastValidPosition.yardage;
            gameState.position = gameState.lastValidPosition.position;

            gameState.result = `You hit your ${option.id} into the water. You incur a penalty stroke and must replay from your last valid position.`;
        } else {
            gameState.result = `You hit your ${option.id} ${shotDistance} yards into the ${newTerrain}.`;
            gameState.lastValidPosition = { distanceTraveled: gameState.distanceTraveled, yardage: gameState.yardage, position: newTerrain };
            gameState.position = newTerrain;

            // Check if the ball is in the hole
            if (gameState.yardage <= 1) {
                gameState.result = `You hole out from ${shotDistance} yards!`;
                gameState.yardage = 0;
                endHole();
            }
        }
    }

    // Update stats and render
    updateStats();
    renderCourseRepresentation();
    renderSituation();
}

// Function to get the start and end distances of the green on the current hole
function getGreenEdges(holeNumber) {
    const currentHoleLayout = courses.course1[holeNumber - 1].layout;
    let greenSegment = currentHoleLayout.find(segment => segment.type === 'green');
    if (!greenSegment) {
        // If no green segment is found, default to hole location +/- 10 yards
        return { start: courses.course1[holeNumber - 1].holeLocation - 10, end: courses.course1[holeNumber - 1].holeLocation + 10 };
    }
    return { start: greenSegment.start, end: greenSegment.end };
}

// Function to end the current hole and move to the next
function endHole() {
    // Update the scorecard
    const scorecardStrokesCell = document.getElementById(`hole${gameState.hole}-strokes`);
    if (scorecardStrokesCell) {
        scorecardStrokesCell.textContent = gameState.strokes;
    }

    gameState.hole += 1;
    if (gameState.hole > courses.course1.length) {
        alert('Game Over! You completed the course.');
        return;
    }
    // Reset game state for the next hole
    gameState.strokes = 0;
    gameState.distanceTraveled = 0;
    gameState.yardage = courses.course1[gameState.hole - 1].holeLocation;
    gameState.position = 'tee box';
    gameState.lastValidPosition = { distanceTraveled: 0, yardage: gameState.yardage, position: 'tee box' };
    gameState.result = ''; // Reset result for new hole
}

// Function to calculate the probability of making a putt based on distance
function calculatePuttSuccess(distance) {
    // Define make percentages based on distance (in yards)
    // Adjusted for game balance
    let makePercentage = 0;

    if (distance <= 1) {
        makePercentage = 99; // Almost certain
    } else if (distance <= 2) {
        makePercentage = 90;
    } else if (distance <= 5) {
        makePercentage = 70;
    } else if (distance <= 10) {
        makePercentage = 40;
    } else if (distance <= 20) {
        makePercentage = 20;
    } else {
        makePercentage = 10; // Very low chance
    }

    const randomValue = Math.random() * 100;
    return randomValue <= makePercentage;
}

// Utility function to get a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Determining the current position based on the distance traveled
function getCurrentPosition(distanceTraveled, holeNumber) {
    const currentHoleLayout = courses.course1[holeNumber - 1].layout;
    for (const segment of currentHoleLayout) {
        if (distanceTraveled >= segment.start && distanceTraveled < segment.end) {
            return segment.type;
        }
    }
    // If the ball goes beyond the last segment, assume it's rough (could also be out of bounds)
    return 'rough';
}

// Updating the displayed stats based on the current game state
function updateStats() {
    document.getElementById('hole-number').textContent = gameState.hole <= courses.course1.length ? gameState.hole : 'Finished';
    document.getElementById('stroke-count').textContent = gameState.strokes;
    document.getElementById('health').textContent = gameState.stats.health;
    document.getElementById('alcohol').textContent = gameState.stats.alcohol;
    document.getElementById('weed').textContent = gameState.stats.weed;
    document.getElementById('balls').textContent = gameState.stats.balls;
    document.getElementById('confidence').textContent = gameState.stats.confidence;
}

export { startGame };




