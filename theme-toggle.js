
document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('themeToggle');

  // Function to set theme
  function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateNavbarText(isDark);
  }

  // Function to update navbar text
  function updateNavbarText(isDark) {
    // Split the text content
    const themeTextParts = themeToggle.textContent.split("/").map(part => part.trim());

    // Update the theme part based on the dark mode status
    const newThemeText = `${isDark ? 'dark-mode' : 'light-mode'}`;

    // Initialize fixed and variable parts
    let fixedPart = "atomazu.github.io";
    let variablePart = "not-found";

    // Assign fixed and variable parts based on the length of split text
    if (themeTextParts.length === 2) {
      fixedPart = themeTextParts[0] || fixedPart;
      variablePart = themeTextParts[1] || variablePart;
    } else if (themeTextParts.length > 2) {
      fixedPart = themeTextParts[1] || fixedPart;
      variablePart = themeTextParts[2] || variablePart;
    }

    // Construct the new text content
    themeToggle.textContent = `${newThemeText} / ${fixedPart} / ${variablePart}`;
  }

  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme === 'dark');

  // Toggle theme when navbar brand is clicked
  themeToggle.addEventListener('click', function (e) {
    e.preventDefault();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
  });
});