// Pie Chart
function updatePieChart(taskType) {
    if (typeof StudyFlowData === 'undefined') {
        console.error('PieChart: StudyFlowData не загружен');
        return;
    }

    const data = StudyFlowData.getPieChartData(taskType);

    const option = {
        textStyle: {
            fontFamily: 'var(--font-family)',
            fontWeight: 600,
            fontSize: 13,
            color: '#1a1a1a'
        },
        tooltip: {
            show: true, // ВКЛЮЧАЕМ ВСТРОЕННЫЕ ТУЛТИПЫ ECHARTS ДЛЯ РЕЗЕРВА
            trigger: 'item',
            formatter: function(params) {
                return `
                    <div style="font-family: var(--font-family); font-weight: 600;">
                        <div style="display: flex; align-items: center; margin-bottom: 4px;">
                            <div style="width: 12px; height: 12px; background: ${params.color}; border-radius: 2px; margin-right: 8px;"></div>
                            <strong>${params.name}</strong>
                        </div>
                        <div>${params.value}%</div>
                    </div>
                `;
            },
            backgroundColor: '#fff',
            borderColor: '#e1e4e8',
            borderWidth: 1,
            textStyle: {
                color: '#1a1a1a',
                fontFamily: 'var(--font-family)',
                fontSize: 12,
                fontWeight: 600
            },
            extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; padding: 12px;'
        },
        legend: {
            orient: 'vertical',
            right: 5,
            top: 'center',
            textStyle: {
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-family)',
                color: '#1a1a1a'
            },
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 10,
            width: '25%',
            formatter: function (name) {
                return name.length > 10 ? name.substring(0, 10) + '...' : name;
            }
        },
        series: [
            {
                name: 'Типы задач',
                type: 'pie',
                radius: ['35%', '65%'],
                center: ['35%', '50%'],
                avoidLabelOverlap: true,
                minAngle: 15,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outer',
                    alignTo: 'none',
                    bleedMargin: 5,
                    distanceToLabelLine: 5,
                    formatter: function (params) {
                        const shortName = params.name.length > 6 ?
                            params.name.substring(0, 6) + '...' : params.name;
                        return `{b|${shortName}}\n{d|${params.percent}%}`;
                    },
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-family)',
                    color: '#1a1a1a',
                    lineHeight: 14,
                    rich: {
                        b: {
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#1a1a1a',
                            fontFamily: 'var(--font-family)'
                        },
                        d: {
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#5470C6',
                            fontFamily: 'var(--font-family)'
                        }
                    }
                },
                labelLine: {
                    length: 15,
                    length2: 8,
                    smooth: 0.2,
                    lineStyle: {
                        width: 1,
                        color: '#e1e4e8'
                    }
                },
                data: data,
                emphasis: {
                    scale: false,
                    focus: 'self',
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    if (window.pieChart && typeof window.pieChart.setOption === 'function') {
        window.pieChart.setOption(option, true);

        // ДОБАВЛЯЕМ ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ КАСТОМНЫХ ТУЛТИПОВ
        setupPieChartTooltips();
    }
}

function setupPieChartTooltips() {
    if (!window.pieChart) return;

    // Удаляем старые обработчики
    window.pieChart.off('mouseover');
    window.pieChart.off('mouseout');
    window.pieChart.off('mousemove');
    window.pieChart.off('click');

    // Обработчик наведения для десктопа
    window.pieChart.on('mouseover', function(params) {
        if (window.chartTooltipManager && !window.chartTooltipManager.isMobile) {
            showPieChartTooltip(params);
        }
    });

    // Обработчик ухода мыши
    window.pieChart.on('mouseout', function() {
        if (window.chartTooltipManager && !window.chartTooltipManager.isMobile) {
            window.chartTooltipManager.hideTooltip();
        }
    });

    // Обработчик движения мыши для обновления позиции
    window.pieChart.on('mousemove', function(params) {
        if (window.chartTooltipManager && !window.chartTooltipManager.isMobile &&
            window.chartTooltipManager.currentTooltip) {
            updatePieChartTooltipPosition(params);
        }
    });

    // Обработчик клика для мобильных
    window.pieChart.on('click', function(params) {
        if (window.chartTooltipManager && window.chartTooltipManager.isMobile) {
            showPieChartTooltip(params);
        }
    });
}

function showPieChartTooltip(params) {
    if (!window.chartTooltipManager || !params) return;

    const color = params.color;
    const tooltipContent = `
        <div class="tooltip-content">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; background: ${color}; border-radius: 2px; margin-right: 8px;"></div>
                <strong style="font-family: var(--font-family); font-size: 14px; font-weight: 700;">${params.name}</strong>
            </div>
            <div style="font-family: var(--font-family); font-size: 13px; font-weight: 600; color: #1a1a1a;">
                ${params.value}%
            </div>
        </div>
    `;

    // Создаем кастомное событие для позиционирования
    const event = {
        clientX: params.event.event.clientX,
        clientY: params.event.event.clientY,
        type: params.event.event.type
    };

    window.chartTooltipManager.showTooltip(event, tooltipContent, 'pie-chart');
}

function updatePieChartTooltipPosition(params) {
    if (!window.chartTooltipManager || !window.chartTooltipManager.currentTooltip || !params) return;

    const event = params.event.event;
    const tooltip = window.chartTooltipManager.currentTooltip;

    if (window.chartTooltipManager.isMobile) {
        // Для мобильных используем стандартное позиционирование
        return;
    }

    // Для десктопа обновляем позицию
    const offsetX = 15;
    const offsetY = 15;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    let tooltipX = mouseX + offsetX;
    let tooltipY = mouseY + offsetY;

    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Проверяем границы экрана
    if (tooltipX + tooltipRect.width > windowWidth - 10) {
        tooltipX = mouseX - tooltipRect.width - offsetX;
    }

    if (tooltipY + tooltipRect.height > windowHeight - 10) {
        tooltipY = mouseY - tooltipRect.height - offsetY;
    }

    if (tooltipX < 10) {
        tooltipX = 10;
    }

    if (tooltipY < 10) {
        tooltipY = 10;
    }

    tooltip.style.left = tooltipX + 'px';
    tooltip.style.top = tooltipY + 'px';
}

function initPieChart() {
    const chartDom = document.getElementById('pieChart');
    if (!chartDom) return;

    window.pieChart = echarts.init(chartDom);
    updatePieChart('all');

    window.addEventListener('resize', function() {
        if (window.pieChart) {
            setTimeout(() => {
                window.pieChart.resize();
            }, 100);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof echarts !== 'undefined') {
        initPieChart();
    }

    const taskTypeSelect = document.querySelector('.chart-item:nth-child(4) .filter-select');
    if (taskTypeSelect) {
        taskTypeSelect.addEventListener('change', function() {
            updatePieChart(this.value);
        });
    }
});

window.updatePieChart = updatePieChart;