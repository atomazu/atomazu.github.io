let isaacData;
let iconLinks;

async function loadIsaacData() {
  try {
    const [isaacResponse, iconResponse] = await Promise.all([
      fetch("/data/isaac.json"),
      fetch("/data/icon_links.json"),
    ]);

    if (!isaacResponse.ok || !iconResponse.ok) {
      throw new Error("Failed to fetch data");
    }

    isaacData = await isaacResponse.json();
    iconLinks = await iconResponse.json();

    renderUI();
    setupEventListeners();
  } catch (error) {
    console.error("Error loading data:", error);
    document.getElementById("isaac-tracker").innerHTML =
      "<p>Error loading game data. Please try refreshing the page.</p>";
  }
}

function renderUI() {
  const container = document.getElementById("isaac-tracker");
  container.innerHTML = `
        <div class="mb-4 bg-gray-100 p-4 rounded-lg">
            <h1 class="text-2xl font-bold mb-2">The Binding of Isaac: ${isaacData.gameVersion} Tracker</h1>
            <p class="text-sm text-gray-600">Last updated: ${isaacData.lastUpdated}</p>
            <div id="stats-section" class="mt-4">
                <!-- Stats will be inserted here -->
            </div>
            <div class="flex flex-wrap items-center mt-2">
                <input type="text" id="search-input" placeholder="Search..." class="flex-grow p-2 border rounded mr-2">
                <select id="filter-select" class="p-2 border rounded">
                    <option value="all">All</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="complete">Complete</option>
                </select>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div id="characters-container" class="bg-white p-4 rounded shadow">
                <h2 class="text-xl font-bold mb-2">Characters</h2>
                <div id="characters-accordion"></div>
            </div>
            <div id="challenges-container" class="bg-white p-4 rounded shadow">
                <h2 class="text-xl font-bold mb-2">Challenges</h2>
                <div id="challenges-accordion"></div>
            </div>
        </div>
        <button id="reset-all" class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300">Reset All Progress</button>
    `;
  renderCharacters();
  renderChallenges();
  updateStats();
}

function renderCharacters() {
  const container = document.getElementById("characters-accordion");
  container.innerHTML = isaacData.characters
    .map(
      (character, index) => `
        <div class="character-item mb-4" data-character="${character.name.toLowerCase()}">
            <div class="bg-gray-200 p-3 rounded cursor-pointer hover:bg-gray-300 transition duration-300" onclick="toggleCharacterContent(${index})">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-lg">${character.name}</span>
                </div>
            </div>
            <div id="character-content-${index}" class="hidden mt-2 max-h-80 overflow-y-auto">
                ${renderCompletionMarks(character)}
            </div>
        </div>
    `
    )
    .join("");
}

function renderCompletionMarks(character) {
  return character.completionMarks
    .map((mark, index) => {
      const iconName = mark.name;
      const iconSrc = iconLinks[iconName] || "";
      const completed = isCompleted(character.name, mark.name);
      return `
          <div class="completion-mark ${
            completed ? "completed bg-green-100" : "bg-gray-200"
          } 
               ${
                 character.priorityMarks &&
                 character.priorityMarks.includes(index)
                   ? "priority"
                   : ""
               } 
               mb-2 p-2 rounded cursor-pointer hover:bg-gray-300 transition duration-300"
               onclick="toggleCompletionMark('${character.name}', '${
        mark.name
      }')" data-mark="${mark.name}">
            <div class="flex items-center justify-between">
              <img src="${iconSrc}" alt="${mark.name}" title="${
        mark.name
      }" class="completion-mark-icon mr-2">
              <span class="${
                completed ? "line-through text-gray-500" : "font-semibold"
              }">
                ${mark.name} (${mark.boss})
              </span>
            </div>
            <div class="text-sm mt-1">
              <div><strong>Unlock:</strong> <a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${encodeURIComponent(
                mark.unlock
              )}&go=Search" 
                   target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${
                     mark.unlock
                   }</a></div>
              ${
                mark.availableSince
                  ? `<div><strong>Available since:</strong> ${mark.availableSince}</div>`
                  : ""
              }
            </div>
          </div>
        `;
    })
    .join("");
}

function renderChallenges() {
  const container = document.getElementById("challenges-accordion");
  container.innerHTML = isaacData.challenges
    .map(
      (challenge, index) => `
        <div class="challenge-item mb-2" data-challenge="${challenge.name.toLowerCase()}">
            <div class="p-3 ${
              challenge.priority ? "bg-yellow-200" : "bg-gray-200"
            } rounded cursor-pointer hover:bg-gray-300 transition duration-300"
                 onclick="toggleChallengeContent(${index})">
                <div class="flex items-center justify-between">
                    <span class="font-bold">${challenge.name}</span>
                    <span class="text-sm ${
                      isChallengeCompleted(challenge.id)
                        ? "text-green-500"
                        : "text-gray-400"
                    }">${isChallengeCompleted(challenge.id) ? "✓" : "○"}</span>
                </div>
            </div>
            <div id="challenge-content-${index}" class="hidden mt-2 p-3 bg-gray-100 rounded">
                <p><strong>Character:</strong> ${
                  challenge.characterAppearance
                }</p>
                <p><strong>Boss:</strong> ${challenge.boss}</p>
                <p><strong>Unlock:</strong> <a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${encodeURIComponent(
                  challenge.unlockReward
                )}&go=Search" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${
        challenge.unlockReward
      }</a></p>
                <p class="flex items-center flex-wrap"><strong class="mr-2">Starting Health:</strong> ${renderStartingHealth(
                  challenge.startingHealth
                )}</p>
                <p class="flex items-center flex-wrap"><strong class="mr-2">Starting Items:</strong> ${renderStartingItems(
                  challenge.startingItems
                )}</p>
                <p class="flex items-center flex-wrap"><strong class="mr-2">Curses:</strong> ${renderCurses(
                  challenge.curses
                )}</p>
                ${renderItemPools(challenge.itemPool)}
                ${
                  challenge.specialConditions
                    ? `<p><strong>Special Conditions:</strong> ${challenge.specialConditions.join(
                        ", "
                      )}</p>`
                    : ""
                }
                ${
                  challenge.availableFrom
                    ? `<p><strong>Available From:</strong> ${challenge.availableFrom}</p>`
                    : ""
                }
                <button onclick="toggleChallenge(${
                  challenge.id
                })" class="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                    ${
                      isChallengeCompleted(challenge.id)
                        ? "Mark Incomplete"
                        : "Mark Complete"
                    }
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

function renderStartingHealth(health) {
  return health
    .map((h) => {
      const icon = renderHealthIcon(h.type);
      return icon ? `${icon} ${h.amount}` : `${h.type} ${h.amount}`;
    })
    .join(" ");
}

function renderHealthIcon(type) {
  const iconName = type.charAt(0).toUpperCase() + type.slice(1) + " Heart";
  const iconSrc = iconLinks[iconName];
  return iconSrc
    ? `<img src="${iconSrc}" alt="${type} heart" title="${type} heart" class="health-icon">`
    : "";
}

function renderStartingItems(items) {
  return items
    .map((item) => {
      const iconSrc = iconLinks["Key Icon"];
      return iconSrc
        ? `<img src="${iconSrc}" alt="${item}" title="${item}" class="item-icon">`
        : `<span class="item-text">${item}</span>`;
    })
    .join(" ");
}

function renderCurses(curses) {
  const curseIconSrc = iconLinks["Curse Icon"];
  return curses.length > 0
    ? curses
        .map((curse) =>
          curseIconSrc
            ? `<img src="${curseIconSrc}" alt="${curse}" title="${curse}" class="curse-icon">`
            : `<span class="curse-text">${curse}</span>`
        )
        .join(" ")
    : "None";
}

function renderItemPools(itemPool) {
  const pools = Object.entries(itemPool)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => {
      const iconName =
        key.charAt(0).toUpperCase() +
        key
          .slice(1)
          .replace(/([A-Z])/g, " $1")
          .trim();
      const iconSrc = iconLinks[iconName];
      return iconSrc
        ? `<img src="${iconSrc}" alt="${key}" title="${key}" class="item-pool-icon">`
        : `<span class="item-pool-text">${key}</span>`;
    });

  return pools.length > 0
    ? `<p class="flex items-center flex-wrap"><strong class="mr-2">Item Pools:</strong> ${pools.join(
        " "
      )}</p>`
    : "";
}

function calculateCharacterCompletion(character) {
  const completedMarks = character.completionMarks.filter((mark) =>
    isCompleted(character.name, mark.name)
  ).length;
  return Math.round((completedMarks / character.completionMarks.length) * 100);
}

function updateStats() {
  const statsSection = document.getElementById("stats-section");
  const totalMarks = isaacData.characters.reduce(
    (total, character) => total + character.completionMarks.length,
    0
  );
  const totalChallenges = isaacData.challenges.length;
  const completedMarks = isaacData.characters.reduce((total, character) => {
    return (
      total +
      character.completionMarks.filter((mark) =>
        isCompleted(character.name, mark.name)
      ).length
    );
  }, 0);
  const completedChallenges = isaacData.challenges.filter((challenge) =>
    isChallengeCompleted(challenge.id)
  ).length;

  const overallCompletion =
    ((completedMarks + completedChallenges) / (totalMarks + totalChallenges)) *
    100;
  const charactersCompletion = (completedMarks / totalMarks) * 100;
  const challengesCompletion = (completedChallenges / totalChallenges) * 100;

  statsSection.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat-item">
                <h3 class="font-bold">Overall Completion</h3>
                <p>${overallCompletion.toFixed(2)}%</p>
                <div class="bg-gray-200 rounded-full h-4 overflow-hidden mt-2">
                    <div class="bg-blue-500 h-full" style="width: ${overallCompletion.toFixed(
                      2
                    )}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <h3 class="font-bold">Characters Completion</h3>
                <p>${charactersCompletion.toFixed(2)}%</p>
                <div class="bg-gray-200 rounded-full h-4 overflow-hidden mt-2">
                    <div class="bg-green-500 h-full" style="width: ${charactersCompletion.toFixed(
                      2
                    )}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <h3 class="font-bold">Challenges Completion</h3>
                <p>${challengesCompletion.toFixed(2)}%</p>
                <div class="bg-gray-200 rounded-full h-4 overflow-hidden mt-2">
                    <div class="bg-yellow-500 h-full" style="width: ${challengesCompletion.toFixed(
                      2
                    )}%"></div>
                </div>
            </div>
        </div>
    `;
}

function setupEventListeners() {
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);
  document
    .getElementById("filter-select")
    .addEventListener("change", handleFilter);
  document.getElementById("reset-all").addEventListener("click", handleReset);
}

function toggleCharacterContent(index) {
  const content = document.getElementById(`character-content-${index}`);
  content.classList.toggle("hidden");
}

function toggleCompletionMark(character, mark) {
  const newState = !isCompleted(character, mark);
  localStorage.setItem(`${character}-${mark}`, newState);
  updateCharacterUI(character);
  updateStats();
}

function toggleChallengeContent(index) {
  const content = document.getElementById(`challenge-content-${index}`);
  content.classList.toggle("hidden");
}

function toggleChallenge(challengeId) {
  const newState = !isChallengeCompleted(challengeId);
  localStorage.setItem(`challenge-${challengeId}`, newState);
  updateChallengeUI(challengeId);
  updateStats();
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const items = document.querySelectorAll(".character-item, .challenge-item");
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? "block" : "none";
  });
}

function handleFilter(event) {
  const filterValue = event.target.value;
  const characterItems = document.querySelectorAll(".character-item");
  const challengeItems = document.querySelectorAll(".challenge-item");

  function filterItems(items, isCompleteFunc) {
    items.forEach((item) => {
      switch (filterValue) {
        case "incomplete":
          item.style.display = !isCompleteFunc(item) ? "block" : "none";
          break;
        case "complete":
          item.style.display = isCompleteFunc(item) ? "block" : "none";
          break;
        default:
          item.style.display = "block";
      }
    });
  }

  filterItems(characterItems, (item) => {
    const character = isaacData.characters.find(
      (c) => c.name.toLowerCase() === item.dataset.character
    );
    return calculateCharacterCompletion(character) === 100;
  });

  filterItems(challengeItems, (item) => {
    const challengeId = item
      .querySelector('[onclick^="toggleChallenge"]')
      .getAttribute("onclick")
      .match(/\d+/)[0];
    return isChallengeCompleted(challengeId);
  });
}

function handleReset() {
  if (
    confirm(
      "Are you sure you want to reset all progress? This cannot be undone."
    )
  ) {
    localStorage.clear();
    renderUI();
  }
}

function updateCharacterUI(characterName) {
  const characterItem = document.querySelector(
    `.character-item[data-character="${characterName.toLowerCase()}"]`
  );
  const character = isaacData.characters.find(
    (c) => c.name.toLowerCase() === characterName.toLowerCase()
  );

  // Update completion mark styles
  character.completionMarks.forEach((mark) => {
    const markElement = characterItem.querySelector(
      `.completion-mark[data-mark="${mark.name}"]`
    );
    const markText = markElement.querySelector("span:last-child");

    const completed = isCompleted(characterName, mark.name);
    markElement.classList.toggle("completed", completed);
    markElement.classList.toggle("bg-green-100", completed);
    markElement.classList.toggle("bg-gray-200", !completed);
    markText.classList.toggle("line-through", completed);
    markText.classList.toggle("text-gray-500", completed);
  });
}

function updateChallengeUI(challengeId) {
  const challenge = isaacData.challenges.find((c) => c.id === challengeId);
  const challengeItem = document.querySelector(
    `.challenge-item[data-challenge="${challenge.name.toLowerCase()}"]`
  );
  const completionIndicator = challengeItem.querySelector(
    ".challenge-item > div > div > span:last-child"
  );
  const toggleButton = challengeItem.querySelector("button");
  const completed = isChallengeCompleted(challengeId);

  completionIndicator.textContent = completed ? "✓" : "○";
  completionIndicator.classList.toggle("text-green-500", completed);
  completionIndicator.classList.toggle("text-gray-400", !completed);
  toggleButton.textContent = completed ? "Mark Incomplete" : "Mark Complete";
}

function isCompleted(character, mark) {
  return localStorage.getItem(`${character}-${mark}`) === "true";
}

function isChallengeCompleted(challengeId) {
  return localStorage.getItem(`challenge-${challengeId}`) === "true";
}

// Debounce function to limit the frequency of function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced version of updateStats to improve performance
const debouncedUpdateStats = debounce(updateStats, 250);

// Add event listener for storage changes
window.addEventListener("storage", (event) => {
  if (event.key.startsWith("challenge-") || event.key.includes("-")) {
    debouncedUpdateStats();
  }
});

document.addEventListener("DOMContentLoaded", loadIsaacData);
