export class ContentSliders {
    constructor() {
        this.slider = null;
        this.currentCategory = 0;
        this.contentCache = {};

        if (!document.querySelector('.content-slider')) {
            console.error('Слайдер не найден в DOM');
            return;
        }

        this.loadInitialContent();
        this.initSlider();
    }

    // Загружаем первый контент без анимации
    async loadInitialContent() {
        if (!this.contentCache[0]) {
            this.contentCache[0] = await this.fetchCategoryContent(0);
        }
        this.updateSliderContent(this.contentCache[0]);
    }

    initSlider() {
        const sliderEl = document.querySelector('.content-slider');
        this.slider = new Swiper(sliderEl, {
            slidesPerView: 3,
            spaceBetween: 80,
            speed: 1000,
            effect: 'slide',
            navigation: {
                nextEl: '.next-btn-content',
                prevEl: '.prev-btn-content',
            },
            on: {
                init: () => this.updateNavButtons(),
                slideChange: () => this.updateNavButtons()
            }
        });
    }

    async loadContent(categoryIndex) {
        if (this.currentCategory === categoryIndex) return;

        const wrapper = document.querySelector('.content-slider .swiper-wrapper');

        // 1. Плавно скрываем текущий контент (если это не первая загрузка)
        if (this.currentCategory !== null) { // Проверяем, не первая ли загрузка
            wrapper.style.opacity = '0';
            wrapper.style.transition = 'opacity 1.1s ease, transform 0.5s ease';
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ждём завершения анимации
        }

        // 2. Загружаем новый контент (если его нет в кэше)
        if (!this.contentCache[categoryIndex]) {
            this.showLoader();
            this.contentCache[categoryIndex] = await this.fetchCategoryContent(categoryIndex);
            this.hideLoader();
        }

        // 3. Обновляем слайдер
        this.updateSliderContent(this.contentCache[categoryIndex]);

        // 4. Плавно показываем новый контент (если это не первая загрузка)
        if (this.currentCategory !== null) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Небольшая пауза перед появлением
            wrapper.style.opacity = '1';
        }

        this.currentCategory = categoryIndex;
    }

    updateSliderContent(content) {
        if (!content || content.length === 0) {
            console.error('Получен пустой контент');
            this.showError();
            return;
        }

        const wrapper = document.querySelector('.content-slider .swiper-wrapper');
        let slidesHTML = '';

        content.forEach(item => {
            if (!item) return;

            slidesHTML += `
            <div class="swiper-slide">
                <div class="content-item">
                <h3>${item.title || 'Без названия'}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            </div>
            `;
        });

        wrapper.innerHTML = slidesHTML;
        
        this.slider.update();
        this.updateNavButtons();
    }

    async fetchCategoryContent(categoryIndex) {
        const categories = [
            [
                {
                    title: "1984",
                    description: "Джеймс Кэмерон выпускает культовый фантастический боевик с Арнольдом Шварценеггером, который становится хитом и закладывает основу для будущих сиквелов."
                },
                {
                    title: "1985",
                    description: "Короткометражка «Приключения Андре и пчёлки Уолли» (The Adventures of André & Wally B.) демонстрирует потенциал компьютерной анимации."
                },
                {
                    title: "1986",
                    description: "Сиквел «Чужого» выходит на экраны, получив восторженные отзывы за сочетание ужасов и экшена."
                },
                {
                    title: "1987",
                    description: "Фильм Пола Верховена становится классикой киберпанка, сочетая жестокость, сатиру и футуристический стиль."
                },
                {
                    title: "1988",
                    description: "Новаторский гибрид живого действия и анимации, получивший четыре «Оскара»."
                },
                {
                    title: "1989",
                    description: "Этот анимационный фильм знаменует начало «Ренессанса Disney», возрождая интерес к студийным мультфильмам."
                },
            ],
            [
                {
                    title: "1990",
                    description: "После падения Берлинской стены футбольные клубы ГДР (например, «Динамо Дрезден») вошли в систему ФРГ, изменив европейский футбол."
                },
                {
                    title: "1991",
                    description: "Легендарная советская хоккейная сборная прекратила существование, а её наследники (Россия, Украина и др.) начали выступать отдельно."
                },
                {
                    title: "1992",
                    description: "Сборная США по баскетболу с Майклом Джорданом, Мэджиком Джонсоном и Ларри Бёрдом доминировала, выиграв золото с разгромными счётами."
                },
                {
                    title: "1993",
                    description: "В июне 1993 года «Чикаго Буллз» победили «Финикс Санз» в финале НБА (4–2), закрепив первую «трехлетку» в эпохе Джордана. Майкл стал MVP финала, но неожиданно ушел из баскетбола спустя 2 месяца (вернется в 1995)."
                },
                {
                    title: "1994",
                    description: "Турнир запомнился голом Диего Марадоны после допинга, удалением за удар соперника (Кантареджа) и победой Бразилии в серии пенальти."
                },
                {
                    title: "1995",
                    description: "Майкл Джордан вернулся в баскетбол после бейсбольной паузы и снова привёл «Чикаго Буллз» к чемпионству (1996)."
                },
            ],
            [
                {
                    title: "1996",
                    description: " Этот культовый хип-хоп-альбом с треками Killing Me Softly и Ready or Not стал платиновым и определил звучание 90-х."
                },
                {
                    title: "1997",
                    description: "Один из величайших рэперов был застрелен в Лос-Анджелесе, что обострило противостояние East Coast vs. West Coast."
                },
                {
                    title: "1998",
                    description: "Дебютный сингл 16-летней певицы взорвал чарты, ознаменовав эру поп-принцесс 2000-х."
                },
                {
                    title: "1999",
                    description: "Фестиваль, приуроченный к 30-летию легендарного Вудстока, закончился пожарами и мародёрством из-за жары и агрессии публики."
                },
                {
                    title: "2000",
                    description: "Поп-группа временно прекратила деятельность, а Джастин стал одним из главных артистов 2000-х."
                },
                {
                    title: "2001",
                    description: "После стрельбы в клубе Нью-Йорка продюсер и рэпер оказался в центре скандала, но позже был оправдан."
                },
            ],
            [
                {
                    title: "2002",
                    description: "Rockstar Games выпустила культовый сиквел GTA III с атмосферой 80-х, Майами-вибэ и голосом Рэя Льотты. Игра стала бестселлером и эталоном открытого мира."
                },
                {
                    title: "2003",
                    description: "Blizzard Entertainment изменила индустрию MMORPG, выпустив WoW. Уже через год игра собрала 5 млн подписчиков, став феноменом поп-культуры."
                },
                {
                    title: "2004",
                    description: "Microsoft первой представила консоль седьмого поколения с HD-графикой, мультиплеером через Xbox Live и такими хитами, как Gears of War."
                },
                {
                    title: "2005",
                    description: "Nintendo выпустила Wii с беспроводным контроллером MotionPlus, привлекшим миллионы «негеймеров» (Wii Sports стал безумно популярен)."
                },
                {
                    title: "2006",
                    description: "Valve добавила Portal в сборник The Orange Box. Игра с черным юмором и головоломками на основе порталов стала культовой."
                },
                {
                    title: "2007",
                    description: "С выходом первого iPhone и App Store (2008) началась новая эра – игры вроде Angry Birds и Doodle Jump покорили миллионы."
                },
            ],
            [
                {
                    title: "2008",
                    description: "Стефани Майер завершила свою культовую серию о Белле и Эдварде, а экранизация в 2008–2012 гг. превратила франшизу в глобальный феномен."
                },
                {
                    title: "2009",
                    description: "Амазон представил второе поколение Kindle с улучшенным экраном E-Ink, сделав цифровые книги массовыми и доступными."

                },
                {
                    title: "2010",
                    description: "Реальная история Джеймса Боуэна и его кота Боба покорила мир, став символом надежды и вдохновения."
                },
                {
                    title: "2011",
                    description: "После выхода сериала HBO книги Джорджа Р.Р. Мартина из цикла «Песнь Льда и Пламени» стали бестселлерами, хотя шестой том так и не вышел."
                },
                {
                    title: "2012",
                    description: "Э.Л. Джеймс опубликовала эротический роман, который изначально был фанфиком по «Сумеркам». Книга разошлась миллионными тиражами, несмотря на критику."
                },
                {
                    title: "2013",
                    description: "Канадская писательница получила награду как «мастер современного рассказа», став 13-й женщиной-лауреатом в истории премии."
                },
            ],
            [
                {
                    title: "2014",
                    description: "Космический аппарат Rosetta (ЕКА) доставил зонд Philae на комету Чурюмова—Герасименко. Это достижение открыло новые данные о происхождении Солнечной системы."
                },
                {
                    title: "2015",
                    description: "Ученые впервые зафиксировали гравитационные волны, предсказанные Эйнштейном 100 лет назад. Это открыло новую эру в астрономии."
                },
                {
                    title: "2016",
                    description: "Разработанная DeepMind программа обыграла Ли Седоля, чемпиона мира по го, показав превосходство ИИ в сложных стратегических играх."
                },
                {
                    title: "2017",
                    description: "SpaceX успешно запустила сверхтяжелую ракету Falcon Heavy с Tesla Roadster Илона Маска на борту, совершив прорыв в частной космонавтике."
                },
                {
                    title: "2018",
                    description: "Китайский ученый Хэ Цзянькуй объявил о рождении первых детей с отредактированным геномом, вызвав этические споры во всем мире."
                },
                {
                    title: "2019",
                    description: "Телескоп Event Horizon Telescope показал историческое фото тени черной дыры в галактике M87, подтвердив теорию относительности."
                },
            ],
        ];

        // Гарантируем возврат массива
        return categories[categoryIndex] || [
            { title: "Контент недоступен", description: "Попробуйте позже" }
        ];
    }

    updateNavButtons() {
        const prevBtn = document.querySelector('.prev-btn-content');
        const nextBtn = document.querySelector('.next-btn-content');

        if (this.slider) {
            prevBtn.classList.toggle('hidden', this.slider.isBeginning);
            nextBtn.classList.toggle('hidden', this.slider.isEnd);
        }
    }

    showLoader() {
        const wrapper = document.querySelector('.content-slider .swiper-wrapper');
        wrapper.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                Загрузка...
            </div>
            `;
    }

    hideLoader() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.remove();
    }

    showError() {
        const wrapper = document.querySelector('.content-slider .swiper-wrapper');
        wrapper.innerHTML = `
      <div class="error-message">
        Ошибка загрузки контента
      </div>
    `;
    }
}