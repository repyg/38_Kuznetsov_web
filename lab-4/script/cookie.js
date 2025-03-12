/**
 * Устанавливает cookie с заданным именем, значением и сроком хранения.
 * @param {string} name - Имя cookie.
 * @param {any} value - Данные, которые будут сохранены (автоматически конвертируются в JSON).
 * @param {number} days - Количество дней, в течение которых cookie будет действовать.
 */
export function setCookie(name, value, days) {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;
}

/**
 * Получает значение cookie по имени.
 * @param {string} name - Имя cookie.
 * @returns {any|null} - Возвращает распарсенные данные из JSON или `null`, если cookie не найдено.
 */
export function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return JSON.parse(decodeURIComponent(value));
    }
    return null;
}

/**
 * Сохраняет отзывы в cookie на 7 дней.
 * @param {Array} reviews - Массив отзывов, который будет сохранен.
 */
export function saveReviews(reviews) {
    setCookie("reviews", reviews, 7);
}

/**
 * Загружает отзывы из cookie.
 * @returns {Array|null} - Возвращает массив отзывов или `null`, если cookie не найдено.
 */
export function loadReviews() {
    return getCookie("reviews");
}
