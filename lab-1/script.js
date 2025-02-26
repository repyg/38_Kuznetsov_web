// Создание анимированных сердечек
function createHeart() {
    const hearts = document.querySelectorAll('.heart');
    if (hearts.length >= 20) {
        const oldestHeart = hearts[0];
        oldestHeart.remove();
    }

    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 10 + 3 + 's';
    heart.style.fontSize = Math.random() * 200 + 300 + 'px';
    heart.style.opacity = Math.random() * 0.5 + 0.5;
    document.querySelector('.hearts-container').appendChild(heart);
}

setInterval(createHeart, 1000);