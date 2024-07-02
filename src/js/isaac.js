// isaac.js

let isaacData;

async function loadIsaacData() {
    const response = await fetch('/data/isaac.json');
    isaacData = await response.json();
    renderCharacters();
    renderChallenges();
    updateOverallCompletion();
    setupEventListeners();
}

function renderCharacters() {
    const container = document.getElementById('characters-container');
    isaacData.characters.forEach((character, index) => {
        const characterDiv = document.createElement('div');
        characterDiv.className = 'card';
        characterDiv.innerHTML = `
            <div class="card-header" id="characterHeading${index}" data-toggle="collapse" data-target="#characterCollapse${index}">
                <h2>${character.name}</h2>
            </div>
            <div id="characterCollapse${index}" class="collapse" aria-labelledby="characterHeading${index}" data-parent="#characters-container">
                <div class="card-body">
                    ${renderCompletionMarks(character)}
                </div>
            </div>
        `;
        container.appendChild(characterDiv);
    });
}

function renderCompletionMarks(character) {
    return character.completionMarks.map(mark => `
        <div class="completion-mark">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="${character.name}-${mark.name}"
                    ${isCompleted(character.name, mark.name) ? 'checked' : ''}>
                <label class="form-check-label" for="${character.name}-${mark.name}">
                    ${mark.name} (${mark.boss})
                </label>
            </div>
            <small class="text-muted d-block">Unlock: <a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${encodeURIComponent(mark.unlock)}&go=Search" target="_blank">${mark.unlock}</a></small>
        </div>
    `).join('');
}

function renderChallenges() {
    const container = document.getElementById('challenges-container');
    isaacData.challenges.forEach((challenge, index) => {
        const challengeDiv = document.createElement('div');
        challengeDiv.className = 'card';
        challengeDiv.innerHTML = `
            <div class="card-header" id="challengeHeading${index}" data-toggle="collapse" data-target="#challengeCollapse${index}">
                <h2>${challenge.name}</h2>
            </div>
            <div id="challengeCollapse${index}" class="collapse" aria-labelledby="challengeHeading${index}" data-parent="#challenges-container">
                <div class="card-body">
                    <div class="challenge-item">
                        <p><strong>Character Appearance:</strong> ${challenge.characterAppearance}</p>
                        <p><strong>Starting Health:</strong> ${renderHealth(challenge.startingHealth)}</p>
                        <p><strong>Starting Items:</strong> ${challenge.startingItems.join(', ') || 'None'}</p>
                        <p><strong>Curses:</strong> ${challenge.curses.join(', ')}</p>
                        <p><strong>Item Pool:</strong> Treasure Room: ${challenge.itemPool.treasureRoom ? 'Yes' : 'No'}, Shop: ${challenge.itemPool.shop ? 'Yes' : 'No'}</p>
                        <p><strong>Boss:</strong> ${challenge.boss}</p>
                        <p><strong>Unlock Reward:</strong> <a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${encodeURIComponent(challenge.unlockReward)}&go=Search" target="_blank">${challenge.unlockReward}</a></p>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="challenge-${challenge.id}"
                                ${isChallengeCompleted(challenge.id) ? 'checked' : ''}>
                            <label class="form-check-label" for="challenge-${challenge.id}">Completed</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(challengeDiv);
    });
}

function renderHealth(health) {
    return health.map(h => `${h.amount} ${h.type}`).join(', ');
}

function isCompleted(character, mark) {
    const saved = localStorage.getItem(`${character}-${mark}`);
    return saved === 'true';
}

function isChallengeCompleted(challengeId) {
    const saved = localStorage.getItem(`challenge-${challengeId}`);
    return saved === 'true';
}

function updateOverallCompletion() {
    const totalMarks = isaacData.characters.reduce((total, character) => total + character.completionMarks.length, 0);
    const totalChallenges = isaacData.challenges.length;
    const completedMarks = isaacData.characters.reduce((total, character) => {
        return total + character.completionMarks.filter(mark => isCompleted(character.name, mark.name)).length;
    }, 0);
    const completedChallenges = isaacData.challenges.filter(challenge => isChallengeCompleted(challenge.id)).length;
    
    const overallCompletion = ((completedMarks + completedChallenges) / (totalMarks + totalChallenges)) * 100;
    document.getElementById('overall-completion').textContent = `${overallCompletion.toFixed(2)}%`;
}

function setupEventListeners() {
    document.getElementById('characters-container').addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const [character, mark] = event.target.id.split('-');
            localStorage.setItem(`${character}-${mark}`, event.target.checked);
            updateOverallCompletion();
        }
    });

    document.getElementById('challenges-container').addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const challengeId = event.target.id.split('-')[1];
            localStorage.setItem(`challenge-${challengeId}`, event.target.checked);
            updateOverallCompletion();
        }
    });

    document.getElementById('reset-all').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', loadIsaacData);