// Утилиты данных
const StudyFlowData = {
    // Данные для разных типов задач
    taskData: {
        all: {
            tasks: [12, 19, 3, 5, 2, 3, 7],
            energy: [8, 15, 6, 9, 4, 6, 10],
            lineData: [75, 82, 68, 90],
            stats: {
                week: { totalTasks: 51, avgEnergy: 4.1, productivity: 88, bestPeriod: 'Нед 4' },
                month: { totalTasks: 204, avgEnergy: 4.0, productivity: 85, bestPeriod: 'Неделя 2' },
                quarter: { totalTasks: 612, avgEnergy: 3.9, productivity: 82, bestPeriod: 'Март' }
            }
        },
        study: {
            tasks: [8, 12, 6, 9, 4, 7, 5],
            energy: [7, 10, 5, 8, 3, 6, 4],
            lineData: [68, 75, 72, 80],
            stats: {
                week: { totalTasks: 51, avgEnergy: 4.2, productivity: 92, bestPeriod: 'Нед 2' },
                month: { totalTasks: 204, avgEnergy: 4.1, productivity: 90, bestPeriod: 'Неделя 1' },
                quarter: { totalTasks: 612, avgEnergy: 4.0, productivity: 88, bestPeriod: 'Апрель' }
            }
        },
        work: {
            tasks: [4, 6, 3, 5, 2, 3, 2],
            energy: [3, 5, 2, 4, 1, 2, 1],
            lineData: [45, 52, 48, 55],
            stats: {
                week: { totalTasks: 25, avgEnergy: 3.5, productivity: 78, bestPeriod: 'Нед 3' },
                month: { totalTasks: 100, avgEnergy: 3.4, productivity: 75, bestPeriod: 'Неделя 3' },
                quarter: { totalTasks: 300, avgEnergy: 3.3, productivity: 72, bestPeriod: 'Май' }
            }
        },
        personal: {
            tasks: [2, 4, 1, 3, 1, 2, 1],
            energy: [2, 3, 1, 2, 1, 1, 1],
            lineData: [35, 42, 38, 45],
            stats: {
                week: { totalTasks: 14, avgEnergy: 4.8, productivity: 95, bestPeriod: 'Нед 1' },
                month: { totalTasks: 56, avgEnergy: 4.7, productivity: 93, bestPeriod: 'Неделя 4' },
                quarter: { totalTasks: 168, avgEnergy: 4.6, productivity: 90, bestPeriod: 'Июнь' }
            }
        }
    },

    getCurrentMonth() {
        const months = ['january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
        const now = new Date();
        return months[now.getMonth()];
    },

    getCurrentYear() {
        return new Date().getFullYear();
    },

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ СТАТИСТИКИ
    calculateRealStats: function(period, taskType = 'all') {
        console.log('Calculating stats for:', period, taskType);

        // Используем готовые данные из taskData
        const data = this.taskData[taskType] || this.taskData.all;
        const stats = data.stats[period] || data.stats.week;

        return {
            totalTasks: stats.totalTasks,
            avgEnergy: stats.avgEnergy.toFixed(1),
            productivity: stats.productivity,
            bestPeriod: stats.bestPeriod
        };
    },

    months: {
        january: { name: 'Январь', days: 31, number: 0 },
        february: { name: 'Февраль', days: 28, number: 1 },
        march: { name: 'Март', days: 31, number: 2 },
        april: { name: 'Апрель', days: 30, number: 3 },
        may: { name: 'Май', days: 31, number: 4 },
        june: { name: 'Июнь', days: 30, number: 5 },
        july: { name: 'Июль', days: 31, number: 6 },
        august: { name: 'Август', days: 31, number: 7 },
        september: { name: 'Сентябрь', days: 30, number: 8 },
        october: { name: 'Октябрь', days: 31, number: 9 },
        november: { name: 'Ноябрь', days: 30, number: 10 },
        december: { name: 'Декабрь', days: 31, number: 11 }
    },

    activityLabels: {
        0: 'Нет активности',
        1: 'Низкая активность',
        2: 'Средняя активность',
        3: 'Высокая активность',
        4: 'Очень высокая активность'
    },

    // Получение реального количества дней в месяце с учетом високосного года
    getDaysInMonth(monthKey, year) {
        const month = this.months[monthKey];
        if (monthKey === 'february') {
            return this.isLeapYear(year) ? 29 : 28;
        }
        return month.days;
    },

    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    // Получение дня недели для первого дня месяца (0 - воскресенье, 1 - понедельник, ...)
    getFirstDayOfMonth(monthKey, year) {
        const month = this.months[monthKey];
        const date = new Date(year, month.number, 1);
        // Преобразуем к нашему формату (1 - понедельник, ..., 7 - воскресенье)
        return date.getDay() === 0 ? 7 : date.getDay();
    },

    // Получение количества недель в месяце
    getWeeksInMonth(monthKey, year) {
        const daysInMonth = this.getDaysInMonth(monthKey, year);
        const firstDay = this.getFirstDayOfMonth(monthKey, year);
        return Math.ceil((daysInMonth + firstDay - 1) / 7);
    },

    // Проверка, является ли день текущим
    isToday(day, monthKey, year) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        const month = this.months[monthKey];
        return currentYear === year && currentMonth === month.number && currentDay === day;
    },

    getBarChartData(period = 'week', taskType = 'all') {
        // Используем данные из taskData
        const data = this.taskData[taskType] || this.taskData.all;

        const periodData = {
            week: {
                days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                tasks: data.tasks,
                energy: data.energy
            },
            month: {
                days: ['Нед1', 'Нед2', 'Нед3', 'Нед4'],
                tasks: [25, 30, 28, 22],
                energy: [15, 18, 16, 12]
            },
            quarter: {
                days: ['Месяц1', 'Месяц2', 'Месяц3'],
                tasks: [85, 92, 78],
                energy: [45, 52, 38]
            }
        };
        return periodData[period] || periodData.week;
    },

    getLineChartData(period = 'week', taskType = 'all') {
        // Используем данные из taskData
        const data = this.taskData[taskType] || this.taskData.all;

        const periodData = {
            week: {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                values: [65, 78, 82, 75, 90, 60, 45]
            },
            month: {
                labels: ['Нед1', 'Нед2', 'Нед3', 'Нед4'],
                values: data.lineData
            },
            quarter: {
                labels: ['Месяц1', 'Месяц2', 'Месяц3'],
                values: [75, 82, 68]
            }
        };
        return periodData[period] || periodData.week;
    },

    getPieChartData(taskType = 'all') {
        const data = {
            all: [
                { value: 35, name: 'Учеба' },
                { value: 25, name: 'Работа' },
                { value: 20, name: 'Личные' },
                { value: 15, name: 'Спорт' },
                { value: 5, name: 'Другое' }
            ],
            study: [
                { value: 40, name: 'Лекции' },
                { value: 30, name: 'Практика' },
                { value: 20, name: 'Проекты' },
                { value: 10, name: 'Экзамены' }
            ],
            work: [
                { value: 50, name: 'Задачи' },
                { value: 30, name: 'Встречи' },
                { value: 20, name: 'Исследования' }
            ],
            personal: [
                { value: 40, name: 'Семья' },
                { value: 30, name: 'Хобби' },
                { value: 20, name: 'Отдых' },
                { value: 10, name: 'Здоровье' }
            ]
        };
        return data[taskType] || data.all;
    },

    // Генерация данных для энергетической карты
    generateEnergyMapData(monthKey, year) {
        const daysInMonth = this.getDaysInMonth(monthKey, year);
        const firstDay = this.getFirstDayOfMonth(monthKey, year);
        const weeksInMonth = this.getWeeksInMonth(monthKey, year);

        const data = [];
        let dayCounter = 1;

        // Создаем нужное количество недель
        for (let week = 1; week <= weeksInMonth; week++) {
            const weekData = { week: week, days: {} };

            // Заполняем дни недели
            for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
                const dayName = this.getDayName(dayOfWeek);

                // Для первой недели учитываем смещение первого дня
                if (week === 1 && dayOfWeek < firstDay) {
                    weekData.days[dayName] = null;
                } else if (dayCounter <= daysInMonth) {
                    // Генерируем случайный уровень энергии от 0 до 4
                    const energyLevel = Math.floor(Math.random() * 5);
                    const isToday = this.isToday(dayCounter, monthKey, year);

                    weekData.days[dayName] = {
                        dayNumber: dayCounter,
                        energy: energyLevel,
                        isToday: isToday
                    };
                    dayCounter++;
                } else {
                    weekData.days[dayName] = null;
                }
            }

            data.push(weekData);
        }

        return data;
    },

    getDayName(dayOfWeek) {
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        return days[dayOfWeek - 1];
    },

    getEnergyLevelColor(level) {
        const colors = {
            0: '#ebf8ff',
            1: '#bee3f8',
            2: '#63b3ed',
            3: '#3182ce',
            4: '#2c5282'
        };
        return colors[level] || colors[0];
    },

    getEnergyLevelDescription(level) {
        const descriptions = {
            0: 'Нет активности',
            1: 'Низкая активность',
            2: 'Средняя активность',
            3: 'Высокая активность',
            4: 'Очень высокая активность'
        };
        return descriptions[level] || descriptions[0];
    }
};












