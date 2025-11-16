// Line Chart
// УБРАНО: let lineChart = null;

function updateLineChart(period) {
    const data = StudyFlowData.getLineChartData(period);

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
            // Дополнительные стили для лучшего отображения
            confine: true, // Не выходить за границы контейнера
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border-radius: 8px; padding: 12px;'
        },
        grid: {
            top: '18%',
            right: '6%',
            bottom: '15%',
            left: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: data.labels,
            axisLabel: {
                fontSize: 13,
                fontWeight: '800',
                color: '#1a1a1a',
                fontFamily: 'var(--font-family)',
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
        yAxis: {
            type: 'value',
            name: 'Продуктивность %',
            nameTextStyle: {
                fontSize: 13,
                fontWeight: '800',
                color: '#1a1a1a',
                padding: [0, 0, 0, -25],
                fontFamily: 'var(--font-family)'
            },
            axisLabel: {
                fontSize: 12,
                fontWeight: '700',
                color: '#586069',
                fontFamily: 'var(--font-family)'
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: '#f6f8fa',
                    type: 'dashed'
                }
            },
            min: function(value) {
                return Math.max(0, value.min - 10);
            }
        },
        series: [
            {
                name: 'Продуктивность',
                type: 'line',
                data: data.values,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    color: '#5470C6',
                    width: 3,
                    shadowColor: 'rgba(84, 112, 198, 0.3)',
                    shadowBlur: 8,
                    shadowOffsetY: 2
                },
                itemStyle: {
                    color: '#5470C6',
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    shadowColor: 'rgba(84, 112, 198, 0.5)',
                    shadowBlur: 4
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: 'rgba(84, 112, 198, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(84, 112, 198, 0.05)'
                            }
                        ]
                    }
                }
            }
        ],
        responsive: true,
        maintainAspectRatio: false
    };

    if (window.lineChart && typeof window.lineChart.setOption === 'function') {
        window.lineChart.setOption(option);
        setTimeout(() => {
            window.lineChart.resize();
        }, 100);
    }
}

// Функция для инициализации графика с улучшенными тултипами
function initLineChart() {
    const chartDom = document.getElementById('lineChart');
    if (!chartDom) return;

    window.lineChart = echarts.init(chartDom);

    // Обработчик скролла для мобильных устройств
    const handleMobileScroll = () => {
        if (window.innerWidth <= 768 && window.lineChart) {
            // Скрываем тултипы ECharts при скролле
            window.lineChart.dispatchAction({
                type: 'hideTip'
            });
        }
    };

    // Добавляем обработчик скролла
    window.addEventListener('scroll', handleMobileScroll, { passive: true });

    // Обработчик ресайза
    window.addEventListener('resize', function() {
        if (window.lineChart) {
            window.lineChart.resize();
        }
    });

    updateLineChart('week');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если ECharts уже загружен, инициализируем сразу
    if (typeof echarts !== 'undefined') {
        initLineChart();
    }

    // Обработчик изменения периода
    const periodSelect = document.querySelector('.chart-item:nth-child(1) .filter-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateLineChart(this.value);
        });
    }
});

// Глобальная функция для обновления графика
window.updateLineChart = updateLineChart;