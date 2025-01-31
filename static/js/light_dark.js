// 🛑 Apply the theme as early as possible to prevent flash
(function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }
})();

// 🌙🌞 Handle theme toggle
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn-light-dark");
    const moons = document.querySelectorAll(".moon");
    const suns = document.querySelectorAll(".sun");
    
    // Get stored theme or fallback to Hugo default
    const themeFromLS = localStorage.getItem("theme");
    const themeFromHugo = document.body.classList.contains("dark-theme") ? "dark" : "light";
    let currentTheme = themeFromLS ? themeFromLS : themeFromHugo;

    function updateTheme(isDark) {
        document.body.classList.toggle("dark-theme", isDark);
        moons.forEach(moon => moon.style.display = isDark ? 'none' : 'block');
        suns.forEach(sun => sun.style.display = isDark ? 'block' : 'none');
        
        if (document.getElementById("remark42")) {
            window.REMARK42.changeTheme(isDark ? "dark" : "light");
        }
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    // 🔄 Apply theme settings
    updateTheme(currentTheme === "dark");

    // 🔘 Toggle on button click
    buttons.forEach(btn => {
        btn.addEventListener("click", function () {
            currentTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
            updateTheme(currentTheme === "dark");
        });
    });
});
