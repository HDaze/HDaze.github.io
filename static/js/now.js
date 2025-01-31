document.addEventListener("DOMContentLoaded", function () {
    fetch("https://www.goodreads.com/review/list?v=2&id=76794252&shelf=currently-reading&format=json")
      .then(response => response.json())
      .then(data => {
        if (data.reviews && data.reviews.review.length > 0) {
          document.getElementById("currently-reading").innerHTML =
            "📖 Reading: " + data.reviews.review[0].book.title;
        } else {
          document.getElementById("currently-reading").innerHTML =
            "📖 Not currently reading any book.";
        }
      })
      .catch(error => {
        console.error("Error fetching currently reading:", error);
        document.getElementById("currently-reading").innerHTML =
          "📖 Unable to load reading status.";
      });
  });
  