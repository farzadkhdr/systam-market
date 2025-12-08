// فەنکشنەکانی چارت
class DashboardCharts {
    constructor() {
        this.charts = {};
    }
    
    // دروستکردنی هەموو چارتەکان
    initializeAllCharts() {
        this.createSalesChart();
        this.createProductsChart();
        this.createMonthlyChart();
    }
    
    // چارتی فرۆشتن
    createSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast7Days(),
                datasets: [{
                    label: 'المبيعات اليومية',
                    data: this.generateRandomData(7, 100000, 300000),
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4361ee',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 14
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo'
                        },
                        bodyFont: {
                            family: 'Cairo'
                        },
                        callbacks: {
                            label: function(context) {
                                return 'المبلغ: ' + formatNumber(context.raw) + ' دينار';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: 'Cairo'
                            },
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    // چارتی کاڵاکان
    createProductsChart() {
        const ctx = document.getElementById('productsChart');
        if (!ctx) return;
        
        this.charts.products = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['هواتف ذكية', 'لابتوبات', 'تابلت', 'سماعات', 'شواحن', 'إكسسوارات'],
                datasets: [{
                    data: [35, 25, 15, 10, 8, 7],
                    backgroundColor: [
                        '#4361ee',
                        '#3a0ca3',
                        '#4cc9f0',
                        '#f72585',
                        '#7209b7',
                        '#3f37c9'
                    ],
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverOffset: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo'
                        },
                        bodyFont: {
                            family: 'Cairo'
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} منتج (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // چارتی مانگانە
    createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'المبيعات',
                    data: [650000, 590000, 800000, 810000, 560000, 900000],
                    backgroundColor: 'rgba(67, 97, 238, 0.7)',
                    borderColor: '#4361ee',
                    borderWidth: 2
                }, {
                    label: 'المشتريات',
                    data: [450000, 480000, 400000, 510000, 420000, 470000],
                    backgroundColor: 'rgba(247, 37, 133, 0.7)',
                    borderColor: '#f72585',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value) + ' د';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // نوێکردنەوەی چارت بەپێی داتای نوێ
    updateChart(chartName, newData) {
        if (this.charts[chartName]) {
            this.charts[chartName].data = newData;
            this.charts[chartName].update();
        }
    }
    
    // وەرگرتنی 7 ڕۆژی ڕابردوو
    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('ar-IQ', { weekday: 'short' }));
        }
        return days;
    }
    
    // دروستکردنی داتای هەڕەمەکی
    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return data;
    }
    
    // لابردنی هەموو چارتەکان
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// دروستکردنی نموونە و بارکردنی چارتەکان
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        const dashboardCharts = new DashboardCharts();
        dashboardCharts.initializeAllCharts();
        
        // زیادکردن بۆ گەردوونی
        window.dashboardCharts = dashboardCharts;
    }
});

// فەنکشنی یارمەتیدەر بۆ فۆرماتی ژمارە
function formatNumber(num) {
    return new Intl.NumberFormat('ar-IQ').format(num);
}