const MAX_SEARCH_LENGTH = 50;
const ITEMS_PER_PAGE = 5;
let currentPage = 1;
let searchHistory = [];

const searchInput = document.getElementById("search-input");
const charCount = document.getElementById("char-count");
const searchHistoryList = document.getElementById("search-history-list");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");
const clearHistoryBtn = document.getElementById("clear-history");

// Load saved data from local storage
document.addEventListener("DOMContentLoaded", function () {
  loadAutoPasteToggle();
  loadSearchHistory();
  updateCharCount();
  updatePagination();
});

// Update character count
searchInput.addEventListener("input", updateCharCount);

function updateCharCount() {
  const currentLength = searchInput.value.length;
  charCount.textContent = `${currentLength} / ${MAX_SEARCH_LENGTH} characters`;
}

// Auto Paste Toggle functionality
const autoPasteToggle = document.getElementById("autoPasteToggle");
autoPasteToggle.addEventListener("change", function () {
  localStorage.setItem("autoPasteEnabled", this.checked);
});

function loadAutoPasteToggle() {
  const savedAutoPaste = localStorage.getItem("autoPasteEnabled");
  if (savedAutoPaste !== null) {
    autoPasteToggle.checked = JSON.parse(savedAutoPaste);
  }
}

// Search button functionality
document.getElementById("search-button").addEventListener("click", function () {
  const autoPasteEnabled = autoPasteToggle.checked;

  if (autoPasteEnabled) {
    navigator.clipboard.readText().then(function (text) {
      searchInput.value = text.slice(0, MAX_SEARCH_LENGTH);
      updateCharCount();
      performSearch();
    });
  } else {
    performSearch();
  }
});

// Perform search
function performSearch() {
  const searchTerm = searchInput.value.trim().slice(0, MAX_SEARCH_LENGTH);
  if (searchTerm) {
    addToSearchHistory(searchTerm);
    // Perform search (add your search logic here)
    console.log("Searching for:", searchTerm);
  }
}

// Add to search history
function addToSearchHistory(term) {
  const timestamp = new Date().toLocaleString();
  searchHistory.unshift({ term, timestamp });
  saveSearchHistory();
  updatePagination();
}

// Save search history to local storage
function saveSearchHistory() {
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

// Load search history from local storage
function loadSearchHistory() {
  const savedHistory = localStorage.getItem("searchHistory");
  if (savedHistory) {
    searchHistory = JSON.parse(savedHistory);
    updatePagination();
  }
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(searchHistory.length / ITEMS_PER_PAGE);
  currentPage = Math.min(currentPage, totalPages);

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;

  displaySearchHistory();
}

// Display search history
function displaySearchHistory() {
  searchHistoryList.innerHTML = "";
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = searchHistory.slice(start, end);

  pageItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item search-history-item";

    const termAndTime = document.createElement("div");
    termAndTime.className = "term-and-time";

    const termSpan = document.createElement("span");
    termSpan.textContent = item.term;

    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = item.timestamp;

    termAndTime.appendChild(termSpan);
    termAndTime.appendChild(timeSpan);

    const repeatButton = document.createElement("button");
    repeatButton.textContent = "Repeat Search";
    repeatButton.className = "btn btn-sm btn-outline-secondary";
    repeatButton.addEventListener("click", function () {
      searchInput.value = item.term;
      updateCharCount();
      performSearch();
    });

    listItem.appendChild(termAndTime);
    listItem.appendChild(repeatButton);

    searchHistoryList.appendChild(listItem);
  });
}

// Pagination event listeners
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updatePagination();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(searchHistory.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    updatePagination();
  }
});

// Clear history functionality
clearHistoryBtn.addEventListener("click", () => {
  searchHistory = [];
  saveSearchHistory();
  currentPage = 1;
  updatePagination();
});
