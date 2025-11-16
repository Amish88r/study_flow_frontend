// tooltip.js - улучшенная версия
class TooltipSystem {
    constructor() {
        this.tooltip = null;
        this.init();
    }

    init() {
        console.log('🛠️ TooltipSystem инициализирован');

        // Обработчик для мобильных - закрытие при скролле
        window.addEventListener('scroll', () => {
            if (this.tooltip && window.innerWidth <= 768) {
                this.hide();
            }
        }, { passive: true });

        // Обработчик для закрытия при клике вне тултипа (для всех устройств)
        document.addEventListener('click', (e) => {
            if (this.tooltip) {
                const isMobile = window.innerWidth <= 768;
                // Для мобильных закрываем при клике в любое место кроме тултипа
                // Для десктопа закрываем только при клике вне тултипа и вне energy-day
                if ((isMobile && !e.target.closest('.energy-tooltip')) ||
                    (!isMobile && !e.target.closest('.energy-tooltip') && !e.target.closest('.energy-day'))) {
                    this.hide();
                }
            }
        });

        // Обработчик для тача (мобильные)
        document.addEventListener('touchstart', (e) => {
            if (this.tooltip && window.innerWidth <= 768) {
                if (!e.target.closest('.energy-tooltip')) {
                    this.hide();
                }
            }
        }, { passive: true });
    }

    show(event, content, energyLevel = 0) {
        console.log('🔘 Показываем тултип, мобильный:', window.innerWidth <= 768);
        this.hide();

        // Создаем тултип
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'energy-tooltip';
        this.tooltip.innerHTML = content;

        // Базовые стили
        this.tooltip.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-size: 13px;
            font-family: var(--font-family);
            font-weight: 600;
            max-width: 220px;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        `;

        // Позиционирование
        if (window.innerWidth <= 768) {
            // Мобильные - внизу экрана
            this.tooltip.style.left = '50%';
            this.tooltip.style.bottom = '20px';
            this.tooltip.style.transform = 'translateX(-50%)';
            this.tooltip.style.maxWidth = 'calc(100vw - 40px)';
            this.tooltip.style.minWidth = '280px';

            // Добавляем кнопку закрытия
            this.addCloseButton();

            // Блокируем скролл при открытом тултипе
            document.body.style.overflow = 'hidden';
        } else {
            // Десктоп - позиционируем с отступом от курсора
            this.positionDesktop(event);
            this.tooltip.style.pointerEvents = 'none';
        }

        // Обновляем цвет полоски в соответствии с уровнем энергии
        this.updateScaleColor(energyLevel);

        document.body.appendChild(this.tooltip);
        console.log('✅ Тултип создан');
    }

    positionDesktop(event) {
        const rect = event.target.getBoundingClientRect();
        const tooltipWidth = 220;
        const tooltipHeight = 140; // Примерная высота

        // Позиционируем с отступом от элемента
        let posX = rect.left + rect.width / 2 - tooltipWidth / 2;
        let posY = rect.top - tooltipHeight - 20; // Увеличили отступ сверху

        // Проверяем границы
        if (posX < 10) posX = 10;
        if (posX + tooltipWidth > window.innerWidth - 10) {
            posX = window.innerWidth - tooltipWidth - 10;
        }

        // Если не помещается сверху, показываем снизу
        if (posY < 10) {
            posY = rect.bottom + 20; // Увеличили отступ снизу
        }

        this.tooltip.style.left = posX + 'px';
        this.tooltip.style.top = posY + 'px';
    }

    updateScaleColor(energyLevel) {
        // Цвета соответствующие уровням энергии из energyMap
        const colors = {
            0: '#ebf8ff', // energy-level-0
            1: '#bee3f8', // energy-level-1
            2: '#63b3ed', // energy-level-2
            3: '#3182ce', // energy-level-3
            4: '#2c5282'  // energy-level-4
        };

        const scaleFill = this.tooltip.querySelector('.scale-fill');
        if (scaleFill) {
            scaleFill.style.background = colors[energyLevel] || '#ebf8ff';
        }
    }

    addCloseButton() {
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 12px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #f0f0f0;
            color: #666;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10001;
        `;

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide();
        });

        closeBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.hide();
        }, { passive: true });

        this.tooltip.appendChild(closeBtn);
    }

    hide() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;

            // Восстанавливаем скролл
            document.body.style.overflow = '';

            console.log('🔘 Тултип скрыт');
        }
    }
}

// Создаем глобальный экземпляр
window.tooltipSystem = new TooltipSystem();