document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("themeToggle");

  function setTheme(isDark) {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateNavbarText(isDark);
  }

  function updateNavbarText(isDark) {
    const themeTextParts = themeToggle.textContent
      .split("/")
      .map((part) => part.trim());

    const newThemeText = `${isDark ? "dark-mode" : "light-mode"}`;

    let fixedPart = "atomazu.github.io";
    let variablePart = "not-found";

    if (themeTextParts.length === 2) {
      fixedPart = themeTextParts[0] || fixedPart;
      variablePart = themeTextParts[1] || variablePart;
    } else if (themeTextParts.length > 2) {
      fixedPart = themeTextParts[1] || fixedPart;
      variablePart = themeTextParts[2] || variablePart;
    }

    themeToggle.textContent = `${newThemeText} / ${fixedPart} / ${variablePart}`;
  }

  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme === "dark");

  themeToggle.addEventListener("click", function (e) {
    e.preventDefault();
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(!isDark);
  });
});
