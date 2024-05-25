document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".btn-light-dark");
    const moons = document.querySelectorAll(".moon");
    const suns = document.querySelectorAll(".sun");

    const themeFromLS = localStorage.getItem("theme");
    const themeFromHugo = document.body.classList.contains("dark-theme") ? "dark" : null;
    const currentTheme = themeFromLS ? themeFromLS : themeFromHugo;

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

    updateIcons();

    buttons.forEach(btn => {
        btn.addEventListener("click", function () {
            document.body.classList.toggle("dark-theme");
            let hasComments = document.getElementById("remark42");
            let theme = "light";

            if (document.body.classList.contains("dark-theme")) {
                theme = "dark";
                moons.forEach(moon => moon.style.display = 'none');
                suns.forEach(sun => sun.style.display = 'block');
                if (hasComments) {
                    window.REMARK42.changeTheme("dark");
                }
            } else {
                moons.forEach(moon => moon.style.display = 'block');
                suns.forEach(sun => sun.style.display = 'none');
                if (hasComments) {
                    window.REMARK42.changeTheme("light");
                }
            }
            localStorage.setItem("theme", theme);
        });
    });
});
