import { saveReviews, loadReviews } from "./cookie.js";

document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Проверяем и устанавливаем тему
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Светлая тема";
    }

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
        themeToggle.textContent = body.classList.contains("dark-mode") ? "☀️ Светлая тема" : "🌙 Тёмная тема";
    });

    // Отзывы
    const reviewsContainer = document.querySelector(".reviews-container");
    const reviewForm = document.getElementById("review-form");
    const sortButton = document.getElementById("sort-rating");
    const filterButton = document.getElementById("filter-high");

    let reviews = loadReviews() || [
        { name: "Михаил", text: "Я занимаюсь ML", rating: 5, image: "" },
        { name: "Марина", text: "Всё супер", rating: 5, image: "" },
        { name: "Иван", text: "Такое себе...", rating: 3, image: "" }
    ];

    displayReviews(reviews);

    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const name = document.getElementById("name").value.trim();
        const text = document.getElementById("text").value.trim();
        const rating = parseInt(document.getElementById("rating").value);
        const imageFile = document.getElementById("image").files[0];

        if (!name || !text || isNaN(rating) || rating < 1 || rating > 5) {
            alert("Заполните все поля корректно!");
            return;
        }

        let imageUrl = "";
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imageUrl = e.target.result;
                addReview(name, text, rating, imageUrl);
            };
            reader.readAsDataURL(imageFile);
        } else {
            addReview(name, text, rating, "");
        }
    });

    function addReview(name, text, rating, image) {
        reviews.push({ name, text, rating, image });
        saveReviews(reviews);
        displayReviews(reviews);
        reviewForm.reset();
    }

    function displayReviews(list) {
        reviewsContainer.innerHTML = "";
        list.forEach((review) => {
            const div = document.createElement("div");
            div.classList.add("review-item");
            div.innerHTML = `
                <p><b>${review.name}</b> (${review.rating}★)</p>
                <p>${review.text}</p>
                ${review.image ? `<img src="${review.image}" alt="Отзыв">` : ""}
            `;
            reviewsContainer.appendChild(div);
        });
    }
    
    sortButton.addEventListener("click", function () {
        reviews.sort((a, b) => b.rating - a.rating);
        displayReviews(reviews);
    });

    filterButton.addEventListener("click", function () {
        const filtered = reviews.filter(r => r.rating === 5);
        displayReviews(filtered);
    });
});
