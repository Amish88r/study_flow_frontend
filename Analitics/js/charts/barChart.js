// Bar Chart
// УБРАНО: let barChart = null;

function updateBarChart(period) {
    const data = StudyFlowData.getBarChartData(period);

    const option = {
        textStyle: {
            fontFamily: 'var(--font-family)',
            fontWeight: '700',
            fontSize: 14
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#e1e4e8',
            borderWidth: 1,
            textStyle: {
                color: '#1a1a1a',
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                fontWeight: '700'
            },
            // Улучшенное позиционирование тултипа
            position: function(point, params, dom, rect, size) {
                const domWidth = size.contentSize[0];
                const domHeight = size.contentSize[1];
                const viewWidth = size.viewSize[0];
                const viewHeight = size.viewSize[1];

                let x = point[0];
                let y = point[1];

                // Позиционируем тултип сверху от точки
                y = y - domHeight - 10;

                // Проверяем правую границу
                if (x + domWidth > viewWidth - 10) {
                    x = viewWidth - domWidth - 10;
                }

                // Проверяем левую границу
                if (x < 10) {
                    x = 10;
                }

                // Проверяем верхнюю границу
                if (y < 10) {
                    // Если не помещается сверху, показываем снизу
                    y = point[1] + 20;
                }

                // Проверяем нижнюю границу
                if (y + domHeight > viewHeight - 10) {
                    y = viewHeight - domHeight - 10;
                }

                return [x, y];
            },
            confine: true,
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border-radius: 8px; padding: 12px;'
        },
        legend: {
            data: ['Задачи', 'Энергия'],
            textStyle: {
                fontSize: 14,
                fontWeight: '800',
                fontFamily: 'var(--font-family)',
                color: '#1a1a1a'
            },
            top: 8,
            itemHeight: 14,
            itemWidth: 14,
            itemGap: 16
        },
        grid: {
            top: '22%',
            right: '4%',
            bottom: '15%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.days,
            axisLabel: {
                fontSize: 13,
                fontWeight: '800',
                fontFamily: 'var(--font-family)',
                color: '#1a1a1a',
                margin: 8
            },
            axisLine: {
                lineStyle: {
                    color: '#e1e4e8'
                }
            },
            axisTick: {
                show: false
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Задачи',
                nameTextStyle: {
                    fontSize: 13,
                    fontWeight: '800',
                    fontFamily: 'var(--font-family)',
                    color: '#1a1a1a',
                    padding: [0, 0, 0, -25]
                },
                axisLabel: {
                    fontSize: 12,
                    fontFamily: 'var(--font-family)',
                    color: '#586069',
                    fontWeight: '700'
                },
                splitLine: {
                    lineStyle: {
                        color: '#f6f8fa'
                    }
                }
            },
            {
                type: 'value',
                name: 'Энергия',
                nameTextStyle: {
                    fontSize: 13,
                    fontWeight: '800',
                    fontFamily: 'var(--font-family)',
                    color: '#1a1a1a',
                    padding: [0, 0, 0, -25]
                },
                axisLabel: {
                    fontSize: 12,
                    fontFamily: 'var(--font-family)',
                    color: '#586069',
                    fontWeight: '700'
                },
                splitLine: {
                    show: false
                }
            }
        ],
        series: [
            {
                name: 'Задачи',
                type: 'bar',
                data: data.tasks,
                color: '#5470C6',
                barGap: '0%',
                barCategoryGap: '30%',
                barWidth: '40%',
                itemStyle: {
                    borderRadius: [3, 3, 0, 0],
                    borderWidth: 0
                }
            },
            {
                name: 'Энергия',
                type: 'bar',
                data: data.energy,
                color: '#91CC75',
                barGap: '0%',
                barCategoryGap: '30%',
                barWidth: '40%',
                itemStyle: {
                    borderRadius: [3, 3, 0, 0],
                    borderWidth: 0
                }
            }
        ],
        responsive: true,
        maintainAspectRatio: false
    };

    if (window.barChart && typeof window.barChart.setOption === 'function') {
        window.barChart.setOption(option);
        setTimeout(() => {
            window.barChart.resize();
        }, 100);
    }
}

// Функция для инициализации графика
function initBarChart() {

    const chartDom = document.getElementById('barChart');
    if (!chartDom) return;

    window.barChart = echarts.init(chartDom);

    // Обработчик скролла для мобильных устройств
    const handleMobileScroll = () => {
        if (window.innerWidth <= 768 && window.barChart) {
            window.barChart.dispatchAction({
                type: 'hideTip'
            });
        }
    };

    // Добавляем обработчик скролла
    window.addEventListener('scroll', handleMobileScroll, { passive: true });

    // Обработчик ресайза
    window.addEventListener('resize', function() {
        if (window.barChart) {
            window.barChart.resize();
        }
    });

    updateBarChart('week');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если ECharts уже загружен, инициализируем сразу
    if (typeof echarts !== 'undefined') {
        initBarChart();
    }

    // Обработчик изменения периода
    const periodSelect = document.querySelector('.chart-item:nth-child(3) .filter-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateBarChart(this.value);
        });
    }
});

// Глобальная функция для обновления графика
window.updateBarChart = updateBarChart;