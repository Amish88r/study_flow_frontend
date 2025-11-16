// energyMap.js - с передачей уровня энергии
class EnergyMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('❌ EnergyMap: Контейнер не найден');
            return;
        }
        this.initialize();
    }

    initialize() {
        try {
            if (typeof StudyFlowData === 'undefined') {
                throw new Error('StudyFlowData не загружен');
            }

            this.currentMonth = StudyFlowData.getCurrentMonth();
            this.currentYear = StudyFlowData.getCurrentYear();
            this.data = StudyFlowData.generateEnergyMapData(this.currentMonth, this.currentYear);

            if (!this.data) {
                throw new Error('Нет данных');
            }

            this.render();
            this.attachMonthListener();

            console.log('✅ EnergyMap инициализирован');

        } catch (error) {
            console.error('EnergyMap: Ошибка:', error);
            this.container.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Ошибка загрузки карты</div>';
        }
    }

    attachMonthListener() {
        const select = document.querySelector('.chart-item:nth-child(2) .filter-select');
        if (select) {
            select.value = this.currentMonth;
            select.addEventListener('change', () => {
                this.update(select.value);
            });
        }
    }

    update(monthKey) {
        this.currentMonth = monthKey;
        this.data = StudyFlowData.generateEnergyMapData(this.currentMonth, this.currentYear);
        this.render();
    }

    clear() {
        this.container.innerHTML = "";
    }

    attachTooltip(el, item) {
        if (!item) return;

        const isMobile = window.innerWidth <= 768;

        const showTooltip = (e) => {
            console.log('🖱️ Показываем тултип для дня', item.dayNumber, 'мобильный:', isMobile);

            if (!window.tooltipSystem) {
                console.error('❌ TooltipSystem не доступен');
                return;
            }

            const content = this.createTooltipContent(item);
            // Передаем уровень энергии для цвета полоски
            window.tooltipSystem.show(e, content, item.energy || 0);
        };

        if (!isMobile) {
            // Десктоп - hover
            let timeout;

            el.addEventListener('mouseenter', (e) => {
                timeout = setTimeout(() => {
                    showTooltip(e);
                }, 300);
            });

            el.addEventListener('mouseleave', () => {
                clearTimeout(timeout);
                setTimeout(() => {
                    if (window.tooltipSystem) {
                        window.tooltipSystem.hide();
                    }
                }, 100);
            });

        } else {
            // Мобильные - touchstart
            const handleTouch = (e) => {
                console.log('📱 Touch на день', item.dayNumber);
                e.preventDefault();
                e.stopPropagation();
                showTooltip(e);
            };

            el.addEventListener('touchstart', handleTouch, { passive: false });
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    }

    createTooltipContent(item) {
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const monthNumber = StudyFlowData.months[this.currentMonth]?.number || 0;
        const date = new Date(this.currentYear, monthNumber, item.dayNumber);
        const dayOfWeek = dayNames[date.getDay()];

        const emojis = ['😴', '😊', '😃', '🚀', '🔥'];
        const energyLevel = Math.min(Math.max(item.energy || 0, 0), 4);
        const emoji = emojis[energyLevel];

        const todayBadge = item.isToday ? '<span style="background: #e53e3e; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">Сегодня</span>' : '';
        const scaleWidth = (energyLevel / 4) * 100;
        const monthName = StudyFlowData.months[this.currentMonth]?.name || this.currentMonth;

        return `
            <div style="text-align: center;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 700; font-size: 14px;">
                    <span>${item.dayNumber} ${monthName}, ${dayOfWeek}</span>
                    ${todayBadge}
                </div>
                <div style="font-size: 24px; margin-bottom: 8px;">${emoji}</div>
                <div style="margin-bottom: 10px; line-height: 1.4;">
                    <div style="font-weight: 700; margin-bottom: 4px;">${StudyFlowData.activityLabels[energyLevel] || 'Нет данных'}</div>
                    <div style="font-size: 12px; color: #666;">Уровень энергии: ${energyLevel}/4</div>
                </div>
                <div style="margin-top: 8px;">
                    <div style="height: 6px; background: #f6f8fa; border-radius: 3px; overflow: hidden; border: 1px solid #e1e4e8; margin-bottom: 4px;">
                        <div class="scale-fill" style="height: 100%; border-radius: 2px; width: ${scaleWidth}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        this.clear();
        if (!this.data) return;

        const mapContainer = document.createElement("div");
        mapContainer.className = "energy-map-container";

        // Заголовок дней
        const daysHeader = document.createElement("div");
        daysHeader.className = "energy-days-header";

        const emptyCorner = document.createElement("div");
        emptyCorner.className = "energy-day-header empty-corner";
        daysHeader.appendChild(emptyCorner);

        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement("div");
            dayHeader.className = "energy-day-header";
            dayHeader.textContent = day;
            daysHeader.appendChild(dayHeader);
        });

        mapContainer.appendChild(daysHeader);

        // Сетка карты
        const map = document.createElement("div");
        map.className = "energy-map";

        this.data.forEach((weekObj, weekIndex) => {
            if (!weekObj || !weekObj.days) return;

            const week = document.createElement("div");
            week.className = "energy-week";

            const weekLabel = document.createElement("div");
            weekLabel.className = "energy-week-label";
            weekLabel.textContent = `Нед ${weekObj.week || weekIndex + 1}`;
            week.appendChild(weekLabel);

            const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

            weekDays.forEach(dayKey => {
                const item = weekObj.days[dayKey];
                const cell = document.createElement("div");
                cell.className = "energy-day";

                if (!item) {
                    cell.classList.add("empty");
                    week.appendChild(cell);
                    return;
                }

                const energyLevel = item.energy || 0;
                const bg = StudyFlowData.getEnergyLevelColor ?
                    StudyFlowData.getEnergyLevelColor(energyLevel) : '#ebf8ff';

                cell.style.background = bg;
                cell.textContent = item.dayNumber;
                cell.classList.add(`energy-level-${energyLevel}`);

                if (item.isToday) {
                    cell.classList.add("today");
                }

                this.attachTooltip(cell, item);
                week.appendChild(cell);
            });

            map.appendChild(week);
        });

        mapContainer.appendChild(map);
        this.container.appendChild(mapContainer);

        console.log('✅ Energy Map отрендерен');
    }
}

window.EnergyMap = EnergyMap;
window.updateEnergyMap = function(monthKey) {
    if (window.energyMapInstance) {
        window.energyMapInstance.update(monthKey);
    }
};