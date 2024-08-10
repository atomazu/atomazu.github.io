let isaacData;
let iconLinks;

async function loadIsaacData() {
  try {
    const [isaacResponse, iconResponse] = await Promise.all([
      fetch("/data/isaac_v2.json"),
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
        <div class="glass-card mb-8 p-6">
            <h1 class="text-3xl font-bold mb-4">The Binding of Isaac: ${isaacData.gameVersion} Tracker</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">Last updated: ${isaacData.lastUpdated}</p>
            <div id="stats-section" class="mt-6">
                <!-- Stats will be inserted here -->
            </div>
            <div class="flex flex-wrap items-center mt-4 space-y-2 sm:space-y-0">
                <input type="text" id="search-input" placeholder="Search..." class="flex-grow p-2 mr-2 mb-2 sm:mb-0">
                <select id="filter-select" class="p-2">
                    <option value="all">All</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="complete">Complete</option>
                </select>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div id="characters-container" class="glass-card p-6">
                <h2 class="text-2xl font-bold mb-4">Characters</h2>
                <div id="characters-accordion"></div>
            </div>
            <div id="challenges-container" class="glass-card p-6">
                <h2 class="text-2xl font-bold mb-4">Challenges</h2>
                <div id="challenges-accordion"></div>
            </div>
        </div>
        <button id="reset-all" class="mt-8 w-full sm:w-auto">Reset All Progress</button>
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
          <div class="character-item glass-card mb-4" data-character="${character.name.toLowerCase()}">
              <div class="p-4 cursor-pointer" onclick="toggleCharacterContent(${index})">
                  <div class="flex items-center justify-between">
                      <div class="flex items-center">
                          ${
                            character.characterIconUri
                              ? `<img src="${character.characterIconUri}" alt="${character.name}" class="w-8 h-8 mr-2">`
                              : `<div class="w-8 h-8 mr-2"></div>`
                          } <!-- Placeholder if no icon -->
                          <span class="font-bold text-lg">${
                            character.name
                          }</span>
                      </div>
                      <span class="text-sm completion-percentage">${calculateCharacterCompletion(
                        character
                      )}% Complete</span>
                  </div>
              </div>
              <div id="character-content-${index}" class="hidden p-4 border-t border-gray-200 dark:border-gray-700">
                  ${renderCompletionMarks(character)}
                  ${
                    character.allHardModeUnlock
                      ? `
                  <div class="mt-4">
                      <strong>All Hard Mode Unlock:</strong>
                      <div class="flex items-center mt-2">
                          ${
                            character.allHardModeUnlockIconUrl
                              ? `<img src="${character.allHardModeUnlockIconUrl}" alt="${character.allHardModeUnlock}" class="w-6 h-6 mr-2">`
                              : ""
                          }
                          <a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${encodeURIComponent(
                            character.allHardModeUnlock
                          )}&go=Search
                          )}" 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             class="text-blue-500 dark:text-blue-400 hover:underline mr-2">
                            ${character.allHardModeUnlock}
                          </a>
                      </div>
                  </div>
                  `
                      : ""
                  }
              </div>
          </div>
      `
    )
    .join("");
}

function toggleCharacterContent(index) {
  const content = document.getElementById(`character-content-${index}`);
  content.classList.toggle("hidden");
}

function renderChallenges() {
  const container = document.getElementById("challenges-accordion");
  container.innerHTML = isaacData.challenges
    .map((challenge, index) => {
      const findCharacter = (appearance) => {
        const appearanceLower = appearance.toLowerCase();
        return isaacData.characters.find(
          (char) =>
            char.name.toLowerCase().includes(appearanceLower) ||
            appearanceLower.includes(char.name.toLowerCase())
        );
      };

      const character = findCharacter(challenge.characterAppearance);
      const characterIconUrl = character ? character.characterIconUri : "";

      const renderStartingItems = (items) => {
        if (!items || items.length === 0) {
          return "None";
        }
        return items
          .map(
            (item) => `
          <a href="https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(
            item
          )}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="inline-flex items-center mr-2 mb-1 text-blue-500 dark:text-blue-400 hover:underline">
            ${item}
          </a>
        `
          )
          .join("");
      };

      return `
          <div class="challenge-item glass-card mb-4" data-challenge="${challenge.name.toLowerCase()}" data-challenge-id="${
        challenge.id
      }">
              <div class="p-4 cursor-pointer" onclick="toggleChallengeContent(${index})">
                  <div class="flex items-center justify-between">
                      <div class="flex items-center">
                          ${
                            challenge.achievementIconUri
                              ? `<img src="${challenge.achievementIconUri}" alt="${challenge.name}" class="w-8 h-8 mr-2">`
                              : `<div class="w-8 h-8 mr-2"></div>`
                          }
                          <span class="font-bold text-lg">${
                            challenge.name
                          }</span>
                      </div>
                      <span class="text-sm ${
                        isChallengeCompleted(challenge.id)
                          ? "text-green-500 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-500"
                      }">${
        isChallengeCompleted(challenge.id) ? "✓" : "○"
      }</span>
                  </div>
              </div>
              <div id="challenge-content-${index}" class="hidden p-4 border-t border-gray-200 dark:border-gray-700">
                  <p class="mb-2 flex items-center">
                    <strong class="mr-2">Character:</strong>
                    <a href="https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(
                      challenge.characterAppearance
                    )}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="flex items-center text-blue-500 dark:text-blue-400 hover:underline">
                      ${
                        characterIconUrl
                          ? `<img src="${characterIconUrl}" alt="${challenge.characterAppearance}" class="w-6 h-6 mr-2">`
                          : ""
                      }
                      ${challenge.characterAppearance}
                    </a>
                  </p>
                  <p class="mb-2"><strong>Goal:</strong> <a href="https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(
                    challenge.name
                  )}" target="_blank" rel="noopener noreferrer" class="text-blue-500 dark:text-blue-400 hover:underline">${
        challenge.boss
      }</a></p>
                  <p class="mb-2 flex items-center">
                      <strong class="mr-2">Unlock:</strong>
                      <a href="https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(
                        challenge.unlockReward
                      )}" target="_blank" rel="noopener noreferrer" class="flex items-center hover:underline">
                          ${
                            challenge.unlockRewardIconUrl
                              ? `<img src="${challenge.unlockRewardIconUrl}" alt="${challenge.unlockReward}" class="w-6 h-6 mr-2">`
                              : ""
                          }
                          <span class="text-blue-500 dark:text-blue-400">${
                            challenge.unlockReward
                          }</span>
                      </a>
                  </p>
                  <p class="mb-2"><strong>Reward Type:</strong> ${
                    challenge.unlockRewardType
                  }</p>
                  <p class="flex items-center flex-wrap mb-2"><strong class="mr-2">Starting Health:</strong> ${renderStartingHealth(
                    challenge.startingHealth
                  )}</p>
                  <p class="flex items-center flex-wrap mb-2"><strong class="mr-2">Starting Items:</strong> ${renderStartingItems(
                    challenge.startingItems
                  )}</p>
                  <p class="flex items-center flex-wrap mb-2"><strong class="mr-2">Curses:</strong> ${renderCurses(
                    challenge.curses
                  )}</p>
                  ${renderItemPools(challenge.itemPool)}
                  ${
                    challenge.specialConditions
                      ? `<p class="mb-2"><strong>Special Conditions:</strong> ${challenge.specialConditions.join(
                          ", "
                        )}</p>`
                      : ""
                  }
                  ${
                    challenge.availableFrom
                      ? `<p class="mb-2"><strong>Available From:</strong> ${challenge.availableFrom}</p>`
                      : ""
                  }
                  <button onclick="toggleChallenge(${
                    challenge.id
                  })" class="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300">
                      ${
                        isChallengeCompleted(challenge.id)
                          ? "Mark Incomplete"
                          : "Mark Complete"
                      }
                  </button>
              </div>
          </div>
        `;
    })
    .join("");
}

function renderStartingHealth(health) {
  return health
    .map((h) => {
      const icon = renderHealthIcon(h.type);
      return `<span class="inline-flex items-center mr-2 mb-2">${h.amount} x ${icon}</span>`;
    })
    .join("");
}

function renderHealthIcon(type) {
  const iconName = type.charAt(0).toUpperCase() + type.slice(1) + " Heart";
  const iconSrc = iconLinks[iconName];
  return iconSrc
    ? `<img src="${iconSrc}" alt="${type} heart" title="${type} heart" class="health-icon w-6 h-6 mr-1">`
    : "";
}

function renderStartingItems(items) {
  return items
    .map((item) => {
      const iconSrc = iconLinks["Key Icon"];
      return iconSrc
        ? `<img src="${iconSrc}" alt="${item}" title="${item}" class="item-icon w-6 h-6 mr-2 mb-2">`
        : `<a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${item}" class="glass-link item-link">${item}</a>`;
    })
    .join("");
}

function renderCurses(curses) {
  const curseIconSrc = iconLinks["Curse Icon"];
  return curses.length > 0
    ? curses
        .map((curse) =>
          curseIconSrc
            ? `<img src="${curseIconSrc}" alt="${curse}" title="${curse}" class="curse-icon w-6 h-6 mr-2 mb-2">`
            : `<a href="https://bindingofisaacrebirth.fandom.com/wiki/Curses" class="glass-link curse-link">${curse}</a>`
        )
        .join("")
    : "None";
}

const itemPoolLinks = {
  treasureRoom: "/wiki/Treasure_Room",
  shop: "/wiki/Shop_(Item_Pool)",
};

function renderItemPools(itemPool) {
  const baseUrl = "https://bindingofisaacrebirth.fandom.com";

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

      const wikiPath =
        itemPoolLinks[key] ||
        `/wiki/${encodeURIComponent(key)}_(Item_Pool)?so=search`;
      const url = `${baseUrl}${wikiPath}`;

      return iconSrc
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer"><img src="${iconSrc}" alt="${key}" title="${key}" class="item-pool-icon w-6 h-6 mr-2 mb-2"></a>`
        : `<a href="${url}" target="_blank" rel="noopener noreferrer" class="item-pool-text bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded mr-2 mb-2 hover:underline">${key}</a>`;
    });

  return pools.length > 0
    ? `<p class="flex items-center flex-wrap mb-2"><strong class="mr-2">Item Pools:</strong> ${pools.join(
        ""
      )}</p>`
    : "";
}

function handleMarkHover(element, isHovering) {
  if (isHovering) {
    element.classList.add("hovering");
  } else {
    element.classList.remove("hovering");
  }
}

function calculateCharacterCompletion(character) {
  const completedMarks = character.completionMarks.filter((mark) =>
    isCompleted(character.name, mark.name)
  ).length;
  return Math.round((completedMarks / character.completionMarks.length) * 100);
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start) + "%";
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function animateWidth(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.style.width = progress * (end - start) + start + "%";
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Update the updateStats function
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

  if (!statsSection.querySelector(".stat-item")) {
    // Initial render
    statsSection.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="stat-item">
                <h3 class="font-bold text-lg mb-2">Overall Completion</h3>
                <p class="text-2xl font-bold"><span id="overall-completion">0</span></p>
                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mt-2">
                    <div id="overall-bar" class="progress-bar bg-blue-500 dark:bg-blue-400 h-full" style="width: 0%"></div>
                </div>
            </div>
            <div class="stat-item">
                <h3 class="font-bold text-lg mb-2">Characters Completion</h3>
                <p class="text-2xl font-bold"><span id="characters-completion">0</span></p>
                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mt-2">
                    <div id="characters-bar" class="progress-bar bg-green-500 dark:bg-green-400 h-full" style="width: 0%"></div>
                </div>
            </div>
            <div class="stat-item">
                <h3 class="font-bold text-lg mb-2">Challenges Completion</h3>
                <p class="text-2xl font-bold"><span id="challenges-completion">0</span></p>
                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mt-2">
                    <div id="challenges-bar" class="progress-bar bg-yellow-500 dark:bg-yellow-400 h-full" style="width: 0%"></div>
                </div>
            </div>
        </div>
      `;
  }

  // Animate progress bars and text
  const overallBar = document.getElementById("overall-bar");
  const charactersBar = document.getElementById("characters-bar");
  const challengesBar = document.getElementById("challenges-bar");

  const overallText = document.getElementById("overall-completion");
  const charactersText = document.getElementById("characters-completion");
  const challengesText = document.getElementById("challenges-completion");

  const currentOverallWidth = parseFloat(overallBar.style.width) || 0;
  const currentCharactersWidth = parseFloat(charactersBar.style.width) || 0;
  const currentChallengesWidth = parseFloat(challengesBar.style.width) || 0;

  animateWidth(overallBar, currentOverallWidth, overallCompletion, 500);
  animateWidth(
    charactersBar,
    currentCharactersWidth,
    charactersCompletion,
    500
  );
  animateWidth(
    challengesBar,
    currentChallengesWidth,
    challengesCompletion,
    500
  );

  animateValue(
    overallText,
    parseInt(overallText.textContent),
    Math.round(overallCompletion),
    500
  );
  animateValue(
    charactersText,
    parseInt(charactersText.textContent),
    Math.round(charactersCompletion),
    500
  );
  animateValue(
    challengesText,
    parseInt(challengesText.textContent),
    Math.round(challengesCompletion),
    500
  );
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
    if (markElement) {
      const completed = isCompleted(characterName, mark.name);
      markElement.classList.toggle("completed", completed);
      // Remove any unwanted classes
      markElement.classList.remove("hovering");
    }
  });

  // Update character completion percentage
  const completionPercentage = characterItem.querySelector(
    ".completion-percentage"
  );
  const newCompletion = calculateCharacterCompletion(character);
  completionPercentage.textContent = `${newCompletion}% Complete`;
}

window.handleMarkHover = handleMarkHover;

function setupEventListeners() {
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);
  document
    .getElementById("filter-select")
    .addEventListener("change", handleFilter);
  document.getElementById("reset-all").addEventListener("click", handleReset);
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
  const characterItems = document.querySelectorAll(".character-item");
  const challengeItems = document.querySelectorAll(".challenge-item");

  function searchItems(items, getSearchableContent) {
    items.forEach((item) => {
      const content = getSearchableContent(item).toLowerCase();
      item.style.display = content.includes(searchTerm) ? "block" : "none";
    });
  }

  searchItems(characterItems, (item) => {
    const character = isaacData.characters.find(
      (c) => c.name.toLowerCase() === item.dataset.character
    );
    return `${character.name} ${character.completionMarks
      .map((mark) => `${mark.name} ${mark.boss} ${mark.unlock}`)
      .join(" ")}`;
  });

  searchItems(challengeItems, (item) => {
    const challengeId = parseInt(item.dataset.challengeId);
    const challenge = isaacData.challenges.find((c) => c.id === challengeId);
    return `${challenge.name} ${challenge.characterAppearance} ${
      challenge.boss
    } 
            ${challenge.unlockReward} ${challenge.startingItems.join(" ")} 
            ${challenge.curses.join(" ")} ${
      challenge.specialConditions ? challenge.specialConditions.join(" ") : ""
    }`;
  });
}

function handleFilter(event) {
  const filterValue = event.target.value;
  const characterItems = document.querySelectorAll(".character-item");
  const challengeItems = document.querySelectorAll(".challenge-item");

  function filterItems(items, isCompleteFunc) {
    items.forEach((item) => {
      const isComplete = isCompleteFunc(item);
      switch (filterValue) {
        case "incomplete":
          item.style.display = !isComplete ? "block" : "none";
          break;
        case "complete":
          item.style.display = isComplete ? "block" : "none";
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
    const challengeId = parseInt(item.dataset.challengeId);
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

function updateChallengeUI(challengeId) {
  const challenge = isaacData.challenges.find((c) => c.id === challengeId);
  const challengeItem = document.querySelector(
    `.challenge-item[data-challenge-id="${challengeId}"]`
  );
  const completionIndicator = challengeItem.querySelector(
    ".challenge-item > div > div > span:last-child"
  );
  const toggleButton = challengeItem.querySelector("button");
  const completed = isChallengeCompleted(challengeId);

  completionIndicator.textContent = completed ? "✓" : "○";
  completionIndicator.classList.toggle("text-green-500", completed);
  completionIndicator.classList.toggle("dark:text-green-400", completed);
  completionIndicator.classList.toggle("text-gray-400", !completed);
  completionIndicator.classList.toggle("dark:text-gray-500", !completed);
  toggleButton.textContent = completed ? "Mark Incomplete" : "Mark Complete";
}

function isCompleted(character, mark) {
  return localStorage.getItem(`${character}-${mark}`) === "true";
}

function isChallengeCompleted(challengeId) {
  return localStorage.getItem(`challenge-${challengeId}`) === "true";
}

window.addEventListener("storage", (event) => {
  if (event.key.startsWith("challenge-") || event.key.includes("-")) {
    updateStats();
  }
});

function renderCompletionMarks(character) {
  return character.completionMarks
    .map((mark, index) => {
      const iconName = mark.name;
      const iconSrc = iconLinks[iconName] || "";
      const completed = isCompleted(character.name, mark.name);
      const unlockIconSrc = mark.unlockIconUrl || null;
      const unlockIcon = unlockIconSrc
        ? `<img src="${unlockIconSrc}" alt="${mark.unlock}" title="${mark.unlock}" class="unlock-icon mr-2 w-6 h-6 inline-block">`
        : "";
      return `
        <div class="completion-mark mb-2 p-2 rounded cursor-pointer ${
          completed ? "completed" : ""
        }"
          onclick="toggleCompletionMark(this)"
          data-character="${character.name}"
          data-mark="${mark.name}"
          data-index="${index}">
          <div class="flex items-center">
            <img src="${iconSrc}" alt="${mark.name}" title="${
        mark.name
      }" class="completion-mark-icon mr-2 w-6 h-6">
            <div class="flex-grow">
              <div class="flex items-center justify-between">
                <span class="font-semibold">${mark.name} (${mark.boss})</span>
                <span class="text-sm flex items-center"> 
                    <span class="${
                      completed
                        ? "text-green-500 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    }">${completed ? "✓" : "○"}</span>
                </span> 
              </div>
              <span class="text-sm flex items-center">${unlockIcon} 
              <div class="text-sm mt-1"> 
                <div><strong>Unlock:</strong> <a href="https://bindingofisaacrebirth.fandom.com/wiki/Special:Search?search=${encodeURIComponent(
                  mark.unlock
                )}&go=Search" target="_blank" rel="noopener noreferrer" class="text-blue-500 dark:text-blue-400 hover:underline">${
        mark.unlock
      }</a></div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function toggleCompletionMark(element) {
  const character = element.dataset.character;
  const mark = element.dataset.mark;
  const newState = !isCompleted(character, mark);
  localStorage.setItem(`${character}-${mark}`, newState);

  element.classList.toggle("completed", newState);

  const completionIndicator = element.querySelector(".text-sm:last-child");
  if (completionIndicator) {
    completionIndicator.textContent = newState ? "✓" : "○";
    completionIndicator.classList.toggle("text-green-500", newState);
    completionIndicator.classList.toggle("dark:text-green-400", newState);
    completionIndicator.classList.toggle("text-gray-400", !newState);
    completionIndicator.classList.toggle("dark:text-gray-500", !newState);
  }

  updateCharacterUI(character);
  updateStats();
}

function animateCharacterCompletion(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const interpolatedValue = progress * (end - start) + start;
    element.textContent = `${Math.floor(interpolatedValue)}% Complete`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function updateCharacterUI(characterName) {
  const characterItems = document.querySelectorAll(
    `.character-item[data-character="${characterName.toLowerCase()}"]`
  );
  const character = isaacData.characters.find(
    (c) => c.name.toLowerCase() === characterName.toLowerCase()
  );

  characterItems.forEach((characterItem) => {
    character.completionMarks.forEach((mark, index) => {
      const markElement = characterItem.querySelector(
        `.completion-mark[data-character="${characterName}"][data-index="${index}"]`
      );
      if (markElement) {
        const completed = isCompleted(characterName, mark.name);
        markElement.classList.toggle("completed", completed);

        const completionIndicator = markElement.querySelector(
          ".text-sm:last-child"
        );
        if (completionIndicator) {
          completionIndicator.textContent = completed ? "✓" : "○";
          completionIndicator.classList.toggle("text-green-500", completed);
          completionIndicator.classList.toggle(
            "dark:text-green-400",
            completed
          );
          completionIndicator.classList.toggle("text-gray-400", !completed);
          completionIndicator.classList.toggle(
            "dark:text-gray-500",
            !completed
          );
        }
      }
    });

    const completionPercentage = characterItem.querySelector(
      ".completion-percentage"
    );
    if (completionPercentage) {
      const oldCompletion = parseInt(completionPercentage.textContent);
      const newCompletion = calculateCharacterCompletion(character);
      animateCharacterCompletion(
        completionPercentage,
        oldCompletion,
        newCompletion,
        1000
      );
    }
  });
}

function isCompleted(character, mark) {
  return localStorage.getItem(`${character}-${mark}`) === "true";
}

document.addEventListener("DOMContentLoaded", loadIsaacData);
window.toggleCharacterContent = toggleCharacterContent;
window.toggleCompletionMark = toggleCompletionMark;
window.toggleChallengeContent = toggleChallengeContent;
window.toggleChallenge = toggleChallenge;
