document.addEventListener("DOMContentLoaded", function () {
    const tagTitles = document.querySelectorAll(".tag-title");

    tagTitles.forEach(title => {
        title.addEventListener("click", function () {
            const tagId = this.getAttribute("data-tag");
            const tagList = document.getElementById("tag-list-" + tagId);
            const icon = this.querySelector(".toggle-icon");

            if (tagList) {
                // Toggle visibility
                tagList.classList.toggle("hidden");

                // Change the icon
                if (tagList.classList.contains("hidden")) {
                    icon.innerText = "▶"; // Collapsed state
                } else {
                    icon.innerText = "▼"; // Expanded state
                }
            }
        });
    });
});
