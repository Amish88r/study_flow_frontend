
// Главный файл для инициализации приложения

// Глобальные переменные для графиков
let energyMapInstance = null;
let lineChart = null;
let barChart = null;
let pieChart = null;
function loadSimpleTooltipManager() {
    const script = document.createElement('script');
    script.src = '/study_flow_frontend/Analitics/js/charts/simpleTooltipManager.js';
    document.head.appendChild(script);
}
// Встроенный менеджер тултипов
// Встроенный менеджер тултипов
window.chartTooltipManager = {
    currentTooltip: null,
    isMobile: window.innerWidth <= 768,
    touchStartTime: 0,
    scrollHandlers: new Set(),
    scrollTimeout: null,
    savedScrollPosition: 0,
    initialized: false,
    isShowingTooltip: false,

    init() {
        if (this.initialized) return;

        console.log('Инициализация ChartTooltipManager...');
        this.isMobile = window.innerWidth <= 768;
        this.initGlobalHandlers();
        this.initialized = true;
        console.log('ChartTooltipManager инициализирован, мобильный режим:', this.isMobile);
    },

    showTooltip(event, content, tooltipType = 'global') {
        if (!this.initialized) {
            console.warn('ChartTooltipManager не инициализирован, используем fallback');
            return this.fallbackShowTooltip(event, content);
        }

        if (this.isShowingTooltip) {
            return null;
        }

        this.hideTooltip();

        this.isShowingTooltip = true;

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const tooltip = document.createElement('div');
        tooltip.className = `${tooltipType}-tooltip global-tooltip`;
        tooltip.innerHTML = content;

        // ВАЖНО: Сначала добавляем в DOM, потом позиционируем
        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;

        // Раздельная логика для мобильных и десктопа
        if (this.isMobile) {
            this.setupMobileTooltip(event, tooltip);
        } else {
            this.setupDesktopTooltip(event, tooltip);
        }

        setTimeout(() => {
            this.isShowingTooltip = false;
        }, 100);

        return tooltip;
    },

    setupMobileTooltip(event, tooltip) {
        // Блокируем скролл
        this.savedScrollPosition = window.pageYOffset;
        document.body.classList.add('tooltip-open');

        // Применяем мобильные стили
        tooltip.style.position = 'fixed';
        tooltip.style.left = '50%';
        tooltip.style.bottom = '20px';
        tooltip.style.transform = 'translateX(-50%) translateY(20px)';
        tooltip.style.maxWidth = 'calc(100vw - 40px)';
        tooltip.style.minWidth = '280px';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'auto';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        tooltip.classList.add('mobile-tooltip');

        // Показываем с анимацией
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // Добавляем обработчики
        this.addMobileScrollHandlers();
        this.addMobileBackdrop();
        this.addMobileCloseButton(tooltip);
    },

    setupDesktopTooltip(event, tooltip) {
        // Сначала делаем невидимым
        tooltip.style.opacity = '0';
        tooltip.style.display = 'block';

        // Позиционируем
        this.positionDesktopTooltip(event, tooltip);

        // Показываем с небольшой задержкой
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
    },

    positionDesktopTooltip(event, tooltip) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Используем координаты элемента для EnergyMap, курсор для других
        let x, y;

        if (event.target && event.target.classList.contains('energy-day')) {
            const rect = event.target.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        const offsetX = 15;
        const offsetY = 15;

        let posX = x + offsetX;
        let posY = y + offsetY;

        // Проверяем границы экрана
        if (posX + tooltipRect.width > viewportWidth - 10) {
            posX = x - tooltipRect.width - offsetX;
        }

        if (posX < 10) {
            posX = 10;
        }

        if (posY + tooltipRect.height > viewportHeight - 10) {
            posY = y - tooltipRect.height - offsetY;
        }

        if (posY < 10) {
            posY = 10;
        }

        tooltip.style.position = 'fixed';
        tooltip.style.left = posX + 'px';
        tooltip.style.top = posY + 'px';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.transform = 'none';
    },



    addMobileScrollHandlers() {
        const scrollHandler = () => {
            if (this.currentTooltip) {
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    this.hideTooltip();
                }, 50);
            }
        };

        const targets = [window, document, document.documentElement, document.body];

        targets.forEach(target => {
            target.addEventListener('scroll', scrollHandler, { passive: true });
            this.scrollHandlers.add({ target, event: 'scroll', handler: scrollHandler });
        });
    },

    addMobileBackdrop() {
        let backdrop = document.getElementById('global-tooltip-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'global-tooltip-backdrop';
            backdrop.className = 'global-tooltip-backdrop';
            document.body.appendChild(backdrop);
        }

        backdrop.classList.add('active');

        const backdropClickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideTooltip();
        };

        backdrop.replaceWith(backdrop.cloneNode(true));
        const newBackdrop = document.getElementById('global-tooltip-backdrop');

        newBackdrop.addEventListener('click', backdropClickHandler);
        newBackdrop.addEventListener('touchstart', backdropClickHandler, { passive: false });
    },

    addMobileCloseButton(tooltip) {
        if (!tooltip || !this.isMobile) return;

        const closeButton = document.createElement('div');
        closeButton.className = 'mobile-tooltip-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideTooltip();
        });

        tooltip.appendChild(closeButton);
    },

    removeMobileBackdrop() {
        const backdrop = document.getElementById('global-tooltip-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
        }
    },

    removeMobileScrollHandlers() {
        this.scrollHandlers.forEach(({ target, event, handler }) => {
            target.removeEventListener(event, handler);
        });
        this.scrollHandlers.clear();
        clearTimeout(this.scrollTimeout);
    },

    hideTooltip() {
        if (this.currentTooltip) {
            if (this.isMobile) {
                this.currentTooltip.style.opacity = '0';
                this.currentTooltip.style.transform = 'translateX(-50%) translateY(20px)';

                setTimeout(() => {
                    if (this.currentTooltip) {
                        this.currentTooltip.remove();
                        this.currentTooltip = null;
                    }
                    this.removeMobileScrollHandlers();
                    this.removeMobileBackdrop();

                    // Восстанавливаем скролл
                    document.body.classList.remove('tooltip-open');
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.width = '';
                    document.body.style.height = '';
                    const scrollY = document.body.style.top;
                    document.body.style.top = '';
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);

                    this.isShowingTooltip = false;
                }, 300);
            } else {
                this.currentTooltip.remove();
                this.currentTooltip = null;
                this.removeMobileScrollHandlers();
                this.removeMobileBackdrop();
                document.body.classList.remove('tooltip-open');
                this.isShowingTooltip = false;
            }
        } else {
            this.isShowingTooltip = false;
        }
    },

    hideEChartsTooltips() {
        if (!this.isMobile) return;

        if (window.lineChart) {
            try {
                window.lineChart.dispatchAction({ type: 'hideTip' });
            } catch (e) {
                console.log('LineChart tooltip hidden');
            }
        }
        if (window.barChart) {
            try {
                window.barChart.dispatchAction({ type: 'hideTip' });
            } catch (e) {
                console.log('BarChart tooltip hidden');
            }
        }
        if (window.pieChart) {
            try {
                window.pieChart.dispatchAction({ type: 'hideTip' });
            } catch (e) {
                console.log('PieChart tooltip hidden');
            }
        }
    },

    fallbackShowTooltip(event, content) {
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'global-tooltip';
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);

        this.currentTooltip = tooltip;

        const x = event.clientX + 15;
        const y = event.clientY + 20;

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        tooltip.style.opacity = '1';
        tooltip.style.display = 'block';

        return tooltip;
    },

    initGlobalHandlers() {
        // Закрытие при клике на backdrop
        document.addEventListener('touchstart', (e) => {
            if (this.isMobile && this.currentTooltip) {
                if (!e.target.closest('.global-tooltip') && !e.target.closest('.energy-day')) {
                    this.hideTooltip();
                }
            }
        }, { passive: false });

        // Обработчик скролла
        window.addEventListener('scroll', () => {
            if (this.isMobile && this.currentTooltip) {
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    this.hideTooltip();
                }, 150);
            }

            if (this.isMobile) {
                this.hideEChartsTooltips();
            }
        }, { passive: true });

        // Обработчики для energy-day
        document.addEventListener('click', (e) => {
            const energyDay = e.target.closest('.energy-day');
            if (energyDay && this.isMobile) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Закрытие при изменении размера окна
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            if (this.currentTooltip) {
                this.hideTooltip();
            }
        });

        // Закрытие при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentTooltip) {
                this.hideTooltip();
            }
        });
    }
};

// Функции инициализации графиков
function initBarChart() {
    const container = document.getElementById('barChart');
    if (container && typeof echarts !== 'undefined') {
        window.barChart = echarts.init(container);

        const handleMobileScroll = () => {
            if (window.innerWidth <= 768 && window.barChart) {
                window.barChart.dispatchAction({ type: 'hideTip' });
            }
        };

        window.addEventListener('scroll', handleMobileScroll, { passive: true });

        setTimeout(() => {
            if (window.barChart && typeof window.barChart.resize === 'function') {
                window.barChart.resize();
            }
        }, 100);

        if (typeof updateBarChart === 'function') {
            updateBarChart('week');
        }
        console.log('BarChart инициализирован');
    } else {
        console.error('BarChart container not found or ECharts not loaded');
    }
}

function initLineChart() {
    const container = document.getElementById('lineChart');
    if (container && typeof echarts !== 'undefined') {
        window.lineChart = echarts.init(container);

        const handleMobileScroll = () => {
            if (window.innerWidth <= 768 && window.lineChart) {
                window.lineChart.dispatchAction({ type: 'hideTip' });
            }
        };

        window.addEventListener('scroll', handleMobileScroll, { passive: true });

        setTimeout(() => {
            if (window.lineChart && typeof window.lineChart.resize === 'function') {
                window.lineChart.resize();
            }
        }, 100);
        if (typeof updateLineChart === 'function') {
            updateLineChart('week');
        }
        console.log('LineChart инициализирован');
    } else {
        console.error('LineChart container not found or ECharts not loaded');
    }
}

function initPieChart() {
    const container = document.getElementById('pieChart');
    if (container && typeof echarts !== 'undefined') {
        window.pieChart = echarts.init(container);

        const handleMobileScroll = () => {
            if (window.innerWidth <= 768 && window.pieChart) {
                window.pieChart.dispatchAction({ type: 'hideTip' });
            }
        };

        window.addEventListener('scroll', handleMobileScroll, { passive: true });

        setTimeout(() => {
            if (window.pieChart && typeof window.pieChart.resize === 'function') {
                window.pieChart.resize();
            }
        }, 100);
        if (typeof updatePieChart === 'function') {
            updatePieChart('all');
        }
        console.log('PieChart инициализирован');
    } else {
        console.error('PieChart container not found or ECharts not loaded');
    }
}

function initEnergyMap() {
    console.log('initEnergyMap: Начало инициализации');

    const container = document.getElementById('energyMap');
    if (!container) {
        console.error('initEnergyMap: Контейнер energyMap не найден');
        return;
    }

    if (typeof window.EnergyMap === 'undefined') {
        console.error('initEnergyMap: Класс EnergyMap не загружен');
        return;
    }

    if (typeof StudyFlowData === 'undefined') {
        console.error('initEnergyMap: StudyFlowData не загружен');
        return;
    }

    try {
        energyMapInstance = new window.EnergyMap('energyMap');
        window.energyMapInstance = energyMapInstance;
        console.log('initEnergyMap: Energy Map инициализирован');
    } catch (error) {
        console.error('initEnergyMap: Ошибка инициализации:', error);
    }
}

// Функция для загрузки EnergyMap скрипта
function loadEnergyMapScript() {
    console.log('Загрузка EnergyMap скрипта...');

    if (document.querySelector('script[src*="energyMap"]')) {
        console.log('EnergyMap скрипт уже загружается');
        return;
    }

    const script = document.createElement('script');
    script.src = '/study_flow_frontend/Analitics/js/charts/energyMap.js';
    script.onload = function() {
        console.log('EnergyMap скрипт загружен, повторная инициализация...');
        setTimeout(() => {
            if (typeof window.EnergyMap !== 'undefined') {
                initEnergyMap();
            }
        }, 100);
    };
    script.onerror = function() {
        console.error('Ошибка загрузки EnergyMap скрипта');
    };
    document.head.appendChild(script);
}

// Функция для обновления статистики на основе реальных данных
function updateStats(period, taskType) {
    console.log('Updating stats with:', period, taskType);

    if (typeof StudyFlowData !== 'undefined' && StudyFlowData.calculateRealStats) {
        const stats = StudyFlowData.calculateRealStats(period, taskType);

        if (stats) {
            const totalTasksEl = document.getElementById('totalTasks');
            const avgEnergyEl = document.getElementById('avgEnergy');
            const productivityEl = document.getElementById('productivity');
            const bestDayEl = document.getElementById('bestDay');

            if (totalTasksEl) totalTasksEl.textContent = stats.totalTasks;
            if (avgEnergyEl) avgEnergyEl.textContent = stats.avgEnergy;
            if (productivityEl) productivityEl.textContent = stats.productivity + '%';
            if (bestDayEl) {
                let label = 'Лучший день';
                let bestPeriodText = stats.bestPeriod;

                if (period === 'month') {
                    label = 'Лучшая неделя';
                } else if (period === 'quarter') {
                    label = 'Лучший месяц';
                }

                bestDayEl.textContent = bestPeriodText;

                const labelEl = bestDayEl.parentElement.querySelector('.stat-label');
                if (labelEl) {
                    labelEl.textContent = label;
                }
            }

            console.log('Статистика обновлена:', { period, taskType, stats });
        }
    } else {
        console.warn('StudyFlowData не загружен');
        updateDefaultStats();
    }
}

// Функция для установки статистики по умолчанию
function updateDefaultStats() {
    const totalTasksEl = document.getElementById('totalTasks');
    const avgEnergyEl = document.getElementById('avgEnergy');
    const productivityEl = document.getElementById('productivity');
    const bestDayEl = document.getElementById('bestDay');

    if (totalTasksEl) totalTasksEl.textContent = '195';
    if (avgEnergyEl) avgEnergyEl.textContent = '3.8';
    if (productivityEl) productivityEl.textContent = '88%';
    if (bestDayEl) bestDayEl.textContent = 'Нед 4';
}

// Инициализация всех графиков
function initCharts() {
    if (typeof echarts === 'undefined') {
        console.log('ECharts еще не загружен, повторная попытка...');
        setTimeout(initCharts, 500);
        return;
    }

    try {
        console.log('Инициализация всех графиков...');

        initBarChart();
        initLineChart();
        initPieChart();
        initEnergyMap();

        console.log('Все графики инициализированы');

        setTimeout(() => {
            handleResize();
            setTimeout(handleResize, 500);
        }, 300);

        updateStats('week', 'all');

    } catch (error) {
        console.error('Ошибка инициализации графиков:', error);
    }
}

// Обработка ресайза
function handleResize() {
    console.log('Resize handled, window width:', window.innerWidth);

    if (window.chartTooltipManager) {
        window.chartTooltipManager.isMobile = window.innerWidth <= 768;
    }

    const charts = [window.barChart, window.lineChart, window.pieChart];
    charts.forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            try {
                chart.resize();
            } catch (error) {
                console.error('Error resizing chart:', error);
            }
        }
    });

    setTimeout(() => {
        charts.forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }, 200);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, начинаем инициализацию...');

    if (window.chartTooltipManager && typeof window.chartTooltipManager.init === 'function') {
        window.chartTooltipManager.init();
    }

    const savedTheme = localStorage.getItem('studyflow-theme');
    if (savedTheme) {
        if (typeof changeTheme === 'function') {
            changeTheme(savedTheme);
        }
    }

    updateStats('week', 'all');

    if (typeof StudyFlowData !== 'undefined' && StudyFlowData.getCurrentMonth) {
        const currentMonth = StudyFlowData.getCurrentMonth();
        const monthSelect = document.querySelector('.chart-item:nth-child(2) .filter-select');
        if (monthSelect) {
            monthSelect.value = currentMonth;
        }
    }

    const statsPeriodSelect = document.getElementById('statsPeriodSelect');
    const statsTaskTypeSelect = document.getElementById('statsTaskTypeSelect');

    if (statsPeriodSelect && statsTaskTypeSelect) {
        statsPeriodSelect.addEventListener('change', function() {
            const taskType = statsTaskTypeSelect.value;
            updateStats(this.value, taskType);
        });

        statsTaskTypeSelect.addEventListener('change', function() {
            const period = statsPeriodSelect.value;
            updateStats(period, this.value);
        });
    }

    loadAllScripts();
});

// Функция для загрузки всех скриптов
function loadAllScripts() {
    console.log('Загрузка всех скриптов...');

    // Сначала загружаем простой тултип менеджер
    const tooltipScript = document.createElement('script');
    tooltipScript.src = '/study_flow_frontend/Analitics/js/charts/tooltip.js';
    document.head.appendChild(tooltipScript);

    // Потом EnergyMap
    loadEnergyMapScript();

    // Потом ECharts
    setTimeout(loadECharts, 100);
}

// Функция для загрузки ECharts
function loadECharts() {
    if (typeof echarts !== 'undefined') {
        console.log('ECharts уже загружен');
        initCharts();
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = function() {
        console.log('ECharts загружен');
        setTimeout(initCharts, 100);
    };
    script.onerror = function() {
        console.error('Не удалось загрузить ECharts');
        showEChartsError();
    };
    document.head.appendChild(script);
}

// Функция для показа сообщения об ошибке загрузки ECharts
function showEChartsError() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = '<div style="color: #666; text-align: center; padding: 20px; font-family: var(--font-family);">' +
                             '<div style="font-size: 16px; font-weight: 700; margin-bottom: 10px;">Ошибка загрузки графиков</div>' +
                             '<div style="font-size: 14px;">Пожалуйста, проверьте подключение к интернету и обновите страницу</div>' +
                             '</div>';
    });
}

// Обработчик изменения размера окна
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', function() {
    setTimeout(handleResize, 300);
});

// Глобальные функции для графиков
window.updateBarChart = typeof updateBarChart !== 'undefined' ? updateBarChart : function(period) {
    console.log('updateBarChart called with:', period);
    if (window.barChart && typeof window.barChart.setOption === 'function') {
        const option = {
            title: { text: 'Bar Chart - Fallback', left: 'center' },
            xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
            yAxis: { type: 'value' },
            series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: 'bar' }]
        };
        window.barChart.setOption(option);
    }
};

window.updateLineChart = typeof updateLineChart !== 'undefined' ? updateLineChart : function(period) {
    console.log('updateLineChart called with:', period);
    if (window.lineChart && typeof window.lineChart.setOption === 'function') {
        const option = {
            title: { text: 'Line Chart - Fallback', left: 'center' },
            xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
            yAxis: { type: 'value' },
            series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: 'line' }]
        };
        window.lineChart.setOption(option);
    }
};

window.updatePieChart = typeof updatePieChart !== 'undefined' ? updatePieChart : function(taskType) {
    console.log('updatePieChart called with:', taskType);
    if (window.pieChart && typeof window.pieChart.setOption === 'function') {
        const option = {
            title: { text: 'Pie Chart - Fallback', left: 'center' },
            series: [{
                type: 'pie',
                data: [
                    { value: 335, name: 'Category 1' },
                    { value: 310, name: 'Category 2' },
                    { value: 234, name: 'Category 3' },
                    { value: 135, name: 'Category 4' },
                    { value: 1548, name: 'Category 5' }
                ]
            }]
        };
        window.pieChart.setOption(option);
    }
};

window.updateEnergyMap = typeof updateEnergyMap !== 'undefined' ? updateEnergyMap : function(monthKey) {
    console.log('updateEnergyMap called with:', monthKey);
    if (window.energyMapInstance && typeof window.energyMapInstance.update === 'function') {
        window.energyMapInstance.update(monthKey);
    }
};

// Глобальные функции для темы и меню
window.changeTheme = typeof changeTheme !== 'undefined' ? changeTheme : function(theme) {
    console.log('changeTheme fallback called with:', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('studyflow-theme', theme);
};

window.toggleMobileMenu = typeof toggleMobileMenu !== 'undefined' ? toggleMobileMenu : function() {
    console.log('toggleMobileMenu fallback called');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
};

window.closeMobileMenu = typeof closeMobileMenu !== 'undefined' ? closeMobileMenu : function() {
    console.log('closeMobileMenu fallback called');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
};

window.updateStats = updateStats;

// Функция для принудительного обновления всех графиков
function refreshAllCharts() {
    console.log('Обновление всех графиков...');

    if (window.barChart && typeof updateBarChart === 'function') {
        updateBarChart('week');
    }
    if (window.lineChart && typeof updateLineChart === 'function') {
        updateLineChart('week');
    }
    if (window.pieChart && typeof updatePieChart === 'function') {
        updatePieChart('all');
    }
    if (window.energyMapInstance && typeof updateEnergyMap === 'function') {
        updateEnergyMap(StudyFlowData ? StudyFlowData.getCurrentMonth() : 'march');
    }
    updateStats('week', 'all');

    setTimeout(handleResize, 200);
}

window.refreshAllCharts = refreshAllCharts;

// Обработчик ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e);
});

// Отладочная информация
console.log('Main.js загружен');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded - инициализация');
    });
} else {
    console.log('DOM уже загружен - немедленная инициализация');
    setTimeout(() => {
        if (window.chartTooltipManager && typeof window.chartTooltipManager.init === 'function') {
            window.chartTooltipManager.init();
        }
        loadAllScripts();
    }, 100);
}