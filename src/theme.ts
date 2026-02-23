const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;

if (themeToggle) {
  const currentTheme = localStorage.getItem("theme") ?? "light";

  if (currentTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
  });
}