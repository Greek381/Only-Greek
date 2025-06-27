import { ContentSliders } from "./content-swiper";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

document.addEventListener("DOMContentLoaded", function () {
    const contentSliders = new ContentSliders();
    // ========== Конфигурация ==========
    const pagination = document.getElementById("pagination");
    const bullets = [];
    const totalSlides = 6;
    const radius = 265;
    let currentAngleOffset = 0;
    let activeIndex = 0;

    const labels = ["Кино", "Спорт", "Музыка", "Игры", "Книги", "Наука"];
    const mainPositionAngle = -60; // Фиксированная позиция главной точки (справа сверху)

    // ========== Создание точек пагинации ==========
    function createBullets() {
        for (let i = 0; i < totalSlides; i++) {
            const bullet = document.createElement("div");
            bullet.className = "bullet";
            bullet.dataset.index = i;
            bullet.textContent = i + 1;

            const label = document.createElement("span");
            label.className = "bullet-label";
            label.textContent = labels[i];
            bullet.appendChild(label);

            updateBulletPosition(bullet, i);
            pagination.appendChild(bullet);
            bullets.push(bullet);
        }
    }

    // ========== Позиционирование точек ==========
    function updateBulletPosition(bullet, index, offset = 0) {
        const baseAngle = index * (360 / totalSlides);
        const angle = (baseAngle + offset + mainPositionAngle) * (Math.PI / 180);
        bullet.style.left = `${radius + radius * Math.cos(angle)}px`;
        bullet.style.top = `${radius + radius * Math.sin(angle)}px`;
    }

    // ========== Вращение точек ==========
    function rotateBullets(targetIndex) {
        // Вычисляем минимальный угол поворота
        let angleDiff = ((targetIndex - activeIndex) * (360 / totalSlides)) % 360;

        // Корректируем для минимального поворота
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;

        const startOffset = currentAngleOffset;
        const targetOffset = currentAngleOffset - angleDiff; // Инвертируем для правильного направления
        const duration = 1000;
        let start = null;

        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            // Плавное движение с ease-эффектом
            const easeProgress = Math.sin((progress * Math.PI) / 2);
            currentAngleOffset =
                startOffset + (targetOffset - startOffset) * easeProgress;

            bullets.forEach((bullet, index) => {
                updateBulletPosition(bullet, index, currentAngleOffset);
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                currentAngleOffset = targetOffset;
                activeIndex = targetIndex;
                updateActiveBullet();
            }
        }

        requestAnimationFrame(animate);
    }

    const digitalPagination = document.querySelector(".digital-pagination");
    
    // ========== Инициализация Swiper ==========
    function initSwiper() {
        const swiper = new Swiper(".swiper", {
            loop: true,
            speed: 1000,
            effect: "fade",
            fadeEffect: { crossFade: true },
            on: {
                init: function () {
                    initYears(this);
                    activeIndex = this.realIndex;
                    updateActiveBullet();
                    contentSliders.loadContent(activeIndex);
                },
                slideChange: function () {
                    const newIndex = this.realIndex;
                    if (newIndex !== activeIndex) {
                        rotateBullets(newIndex);
                        activeIndex = newIndex;
                        contentSliders.loadContent(newIndex);
                    }
                    animateYears(this.slides[this.activeIndex]);
                    animateDigitalCounter(newIndex);
                },
            },
        });

        // Навигация
        document.querySelector(".prev-btn").addEventListener("click", () => {
            swiper.slidePrev();
        });

        document.querySelector(".next-btn").addEventListener("click", () => {
            swiper.slideNext();
        });

        // Клик по точкам
        bullets.forEach((bullet) => {
            bullet.addEventListener("click", function () {
                const targetIndex = parseInt(this.dataset.index);
                if (targetIndex !== activeIndex) {
                    swiper.slideToLoop(targetIndex);
                }
            });
        });

        return swiper;
    }

    // ========== Анимация цифрового счетчика ==========
    function animateDigitalCounter(newIndex) {
        const currentValue = parseInt(digitalPagination.textContent.split('/')[0].replace('0', ''));
        const targetValue = newIndex + 1;
        
        // Пропускаем анимацию если значения одинаковые
        if (currentValue === targetValue) return;
        
        // Определяем направление анимации (вперед или назад)
        const direction = targetValue > currentValue ? 1 : -1;
        const steps = Math.abs(targetValue - currentValue);
        const durationPerStep = 0.3; // Длительность одного шага в секундах
        const totalDuration = steps * durationPerStep;
        
        let currentStep = 0;
        const startTime = Date.now();
        
        function updateCounter() {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / totalDuration, 1);
            currentStep = Math.floor(progress * steps);
            
            const currentDisplayValue = currentValue + (currentStep * direction);
            const formattedValue = currentDisplayValue.toString().padStart(2, '0');
            digitalPagination.textContent = `${formattedValue}/0${totalSlides}`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Финальное значение
                const finalValue = targetValue.toString().padStart(2, '0');
                digitalPagination.textContent = `${finalValue}/0${totalSlides}`;
            }
        }
        
        updateCounter();
    }

    // ========== Работа с годами ==========
    function initYears(swiper) {
        swiper.slides.forEach((slide) => {
            const blueText = slide.querySelector(".swiper-slide-text__blue");
            const pinkText = slide.querySelector(".swiper-slide-text__pink");
            blueText.textContent = slide.dataset.yearStart;
            pinkText.textContent = slide.dataset.yearEnd;
        });
    }

    function animateYears(slide) {
        const blueText = slide.querySelector(".swiper-slide-text__blue");
        const pinkText = slide.querySelector(".swiper-slide-text__pink");

        const newStart = parseInt(slide.dataset.yearStart);
        const newEnd = parseInt(slide.dataset.yearEnd);
        
        // Получаем текущие значения
        const currentStart = parseInt(blueText.textContent) || newStart;
        const currentEnd = parseInt(pinkText.textContent) || newEnd;

        // Анимация с шагом в 1 год
        animateYearCounter(blueText, currentStart, newStart);
        animateYearCounter(pinkText, currentEnd, newEnd);
    }

    function animateYearCounter(element, from, to) {
        // Пропускаем анимацию если значения одинаковые
        if (from === to) return;

        // Удаляем предыдущие анимации
        gsap.killTweensOf(element);

        // Вычисляем количество шагов
        const steps = Math.abs(to - from);
        const durationPerStep = 0.1; // Длительность одного шага в секундах
        const totalDuration = steps * durationPerStep;
        
        let currentStep = 0;
        const startTime = Date.now();
        const direction = to > from ? 1 : -1;

        function updateCounter() {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / totalDuration, 1);
            currentStep = Math.floor(progress * steps);
            
            const currentValue = from + (currentStep * direction);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Финальное значение
                element.textContent = to;
            }
        }
        
        updateCounter();
    }

    // ========== Обновление активной точки ==========
    function updateActiveBullet() {
        bullets.forEach((bullet, index) => {
            const isActive = index === activeIndex;
            bullet.classList.toggle("bullet-active", isActive);

            // Обновляем видимость подписи
            const label = bullet.querySelector(".bullet-label");
            if (label) {
                label.style.color = isActive ? "#42567A" : "transparent";
            }
        });
    }

    // Основной код инициализации точек пагинации
    createBullets();

    // Инициализация основного слайдера
    const swiper = initSwiper();

    // Загрузка начального контента
    contentSliders.loadContent(0);

    // Клик по точкам пагинации
    bullets.forEach((bullet) => {
        bullet.addEventListener("click", function () {
            const targetIndex = parseInt(this.dataset.index);
            if (targetIndex !== activeIndex) {
                swiper.slideToLoop(targetIndex);
                contentSliders.loadContent(targetIndex);
            }
        });
    });

    digitalPagination.textContent = `01/0${totalSlides}`;
});