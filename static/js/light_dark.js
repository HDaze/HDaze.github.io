// 🛑 Apply the theme as early as possible to prevent flash
(function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    } else if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
    }
})();

// 🌙🌞 Handle theme toggle
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn-light-dark");
    const moons = document.querySelectorAll(".moon");
    const suns = document.querySelectorAll(".sun");

    // Get the theme stored in localStorage or fallback to default (light)
    const themeFromLS = localStorage.getItem("theme");
    const themeFromHugo = document.body.classList.contains("dark-theme") ? "dark" : "light";
    let currentTheme = themeFromLS ? themeFromLS : themeFromHugo;

    function updateIcons() {
        if (currentTheme === "dark") {
            document.body.classList.add("dark-theme");
            moons.forEach(moon => moon.style.display = 'none');
            suns.forEach(sun => sun.style.display = 'block');
        } else {
            document.body.classList.remove("dark-theme");
            moons.forEach(moon => moon.style.display = 'block');
            suns.forEach(sun => sun.style.display = 'none');
        }
    }

    // Apply theme based on current value (either from LS or default)
    updateIcons();

    // Toggle theme on button click
    buttons.forEach(btn => {
        btn.addEventListener("click", function () {
            // Toggle the theme class on the body element
            document.body.classList.toggle("dark-theme");
            
            let theme = "light";

            if (document.body.classList.contains("dark-theme")) {
                theme = "dark";
                moons.forEach(moon => moon.style.display = 'none');
                suns.forEach(sun => sun.style.display = 'block');
            } else {
                moons.forEach(moon => moon.style.display = 'block');
                suns.forEach(sun => sun.style.display = 'none');
            }

            // Save the theme to localStorage
            localStorage.setItem("theme", theme);
        });
    });

   // Dropdown menu toggle
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

if (dropdownToggles.length > 0) {
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
        });
    });

    // Close dropdown menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = dropdownToggles[0].contains(event.target) || 
                              dropdownToggles[0].nextElementSibling.contains(event.target);
        if (!isClickInside) {
            const dropdownMenus = document.querySelectorAll('.dropdown-menu');
            dropdownMenus.forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

});
