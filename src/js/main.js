'use strict'
window.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabs = document.querySelectorAll('.tabheader__item'),
          tabsContent = document.querySelectorAll('.tabcontent'),
          tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.remove('hide');
        tabsContent[i].classList.add('show', 'fade');
        tabs[i].classList.add('tabheader__item_active')
    }

        hideTabContent();
        showTabContent();

        tabsParent.addEventListener('click', (event) => {
            const target = event.target;

            if (target && target.classList.contains('tabheader__item')) {
                tabs.forEach((item, i) => {
                    if (item == target) {
                        hideTabContent();
                        showTabContent(i);
                    }
                }); 
            };
        });

    // Timer

    const deadline = '2025-04-17';

    function getTimeRemaining(endtime) {
        let days, hours, minutes, seconds;
        const t = Date.parse(endtime) - new Date();

        if (t >= 0) {
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor((t / (1000 * 60 * 60) % 24)),
            minutes = Math.floor((t / 1000 / 60) % 60),
            seconds = Math.floor((t / 1000) % 60);
        } else {
            days = 0
            hours = 0
            minutes = 0
            seconds = 0
        }

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getZero(num) {
        if (num >= 0 && num <= 9) {
            return '0' + num;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
              days = timer.querySelector('#days'),
              hours = timer.querySelector('#hours'),
              minutes = timer.querySelector('#minutes'),
              seconds = timer.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endtime);
            
            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        };
    }

    setClock('.timer', deadline);

    // Modal

    const modalTrigger = document.querySelectorAll('[data-modal]'),
          modal = document.querySelector('.modal');

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        // clearInterval(modalTimerId);
    }
          
    modalTrigger.forEach(btn => {
        btn.addEventListener('click', openModal);
    }); 
    

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }   
    });

    // const modalTimerId = setTimeout(openModal, 40000);

    function showModalByScroll() {
        if (window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);


    // Использую классы для шаблонизации карточек меню

    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 90;
            this.changeToRub();
        }

        changeToRub() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');
            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }
            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> руб/день</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url);
    
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
    
        return await res.json()
      };

    //   Так же можно использовать json-server, изменить url 
    //   И можно без проверки на массив для метода forEach
  
    getResource('menu.json')
    .then(data => {
        const menuItems = Array.isArray(data) ? data : data.menu; 
        if (!Array.isArray(menuItems)) {
            throw new Error("Ожидался массив, но получено: " + JSON.stringify(data));
        }
        menuItems.forEach(({img, altimg, title, descr, price}) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
        });
    })
    .catch(error => console.error("Ошибка загрузки меню:", error));
  

    // Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'icons/spinner.svg',
        failure: 'Что-то пошло не так',
        success: 'Успешно!'
    };

    forms.forEach(item => {
        bindPostData(item);
    });

   const postData = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST', 
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });
        return await res.json();
   }

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formStatus = document.createElement('img');
                formStatus.src = message.loading;
                formStatus.style.cssText = `
                display: block;
                margin: 0 auto;
                `;
                form.insertAdjacentElement('afterend', formStatus);
            

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('menu.json', json)

            .then(data => {
                console.log(data);
                showThanksModal(message.success);
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset();
                formStatus.remove();
            });
        });
    }


    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
            thanksModal.classList.add('modal__dialog');
            thanksModal.innerHTML = `
            <div class='modal__content'>
                <div class='modal__close'>×</div>
                <div class="modal__title">${message}</div>
            </div> 
            `;
        modal.append(thanksModal);

        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    // Hamburger menu

    const burger = document.querySelector('.hamburger'),
          menu = document.querySelector('.header__links'),
          closeBtn = document.querySelector('.menu__close'),
          overlay = document.querySelector('.overlay__links');

    function toggleMenu(state) {
        const isActive = state !== undefined ? state : !menu.classList.contains('header__links_active');
        burger.classList.toggle('hamburger_active', isActive);
        menu.classList.toggle('header__links_active', isActive);
        overlay.classList.toggle('active', isActive);
    }
    // Открытие бургера и меню
    burger.addEventListener('click', () => toggleMenu(true));
    // Закрытие на крестик меню 
    closeBtn.addEventListener('click', () => toggleMenu(false));
    // Закрытие меню при нажатии на оверлей
    overlay.addEventListener('click', () => toggleMenu(false));

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Escape' && menu.classList.contains('header__links_active')) {
            toggleMenu(false);
        }
    });
    
    
    // Slider

    const slides = document.querySelectorAll('.offer__slide'),
          prev = document.querySelector('.offer__slider-prev'),
          next = document.querySelector('.offer__slider-next'),
          total = document.querySelector('#total'),
          curr = document.querySelector('#current');


    let currentIndex = 1;
    
    showSlide(currentIndex);

    if (slides.length < 10) {
        total.textContent = `0${slides.length}`;
    } else {
        total.textContent = slides.length;
    }

    function showSlide(index) {
        if (index > slides.length) {
            currentIndex = 1;
        }
        if (index < 1) {
            currentIndex = slides.length;
        }

        slides.forEach(item => item.style.display = 'none');
        slides[currentIndex - 1].style.display = 'block';

        if (slides.length < 10 ) {
            curr.textContent = `0${currentIndex}`;
        } else {
            curr.textContent = currentIndex;
        }
     }

    function plusSlides(n) {
        showSlide(currentIndex += n);
    }

    prev.addEventListener('click', () => {
        plusSlides(-1);
    });
    next.addEventListener('click', () => {
        plusSlides(1);
    });

});
