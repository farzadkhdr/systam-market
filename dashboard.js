// کۆدی داشبۆرد
document.addEventListener('DOMContentLoaded', function() {
    // داتاکانی داشبۆرد بار بکە
    loadDashboardData();
    
    // نمایش ڕێکەوت
    updateDateTime();
    
    // چارتەکان دروست بکە
    initializeCharts();
    
    // داتای نموونەیی زیاد بکە
    initializeSampleDashboardData();
    
    // دەستکاری کردنەوە
    setupDashboardEventListeners();
});

// داتاکانی داشبۆرد بار بکە
function loadDashboardData() {
    // داتای ناوخۆیی لە localStorage وەرگرە
    const salesData = JSON.parse(localStorage.getItem('salesData')) || getDefaultSalesData();
    const dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || getDefaultDashboardData();
    
    // ئامارەکان نوێ بکەرەوە
    updateDashboardStats(salesData, dashboardData);
    
    // لیستی فرۆشتنی دوایین نوێ بکەرەوە
    updateRecentSales(salesData.sales);
}

// ئامارەکانی داشبۆرد نوێ بکەرەوە
function updateDashboardStats(salesData, dashboardData) {
    // ئاماری گشتی
    document.getElementById('totalSales').textContent = formatNumber(dashboardData.totalSales) + ' دينار';
    document.getElementById('totalPurchases').textContent = formatNumber(dashboardData.totalPurchases) + ' دينار';
    
    // جیاوازی
    const difference = dashboardData.totalSales - dashboardData.totalPurchases;
    document.getElementById('differenceAmount').textContent = formatNumber(difference) + ' دينار';
    
    // گۆڕانکاری
    document.getElementById('salesChange').textContent = dashboardData.salesChange + '%';
    document.getElementById('purchaseChange').textContent = dashboardData.purchaseChange + '%';
    
    // ئاماری کاڵاکان
    document.getElementById('totalProducts').textContent = salesData.products.length;
    document.getElementById('inventoryItems').textContent = salesData.products.length + ' منتج';
    
    // بەهای کاڵاکان
    const inventoryValue = salesData.products.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0);
    document.getElementById('inventoryValue').textContent = formatNumber(inventoryValue) + ' دينار';
    
    // قەرزەکان
    const totalDebt = salesData.customers.reduce((sum, customer) => sum + customer.debt, 0);
    const debtorsCount = salesData.customers.filter(c => c.debt > 0).length;
    document.getElementById('totalDebt').textContent = formatNumber(totalDebt) + ' دينار';
    document.getElementById('debtorsCount').textContent = debtorsCount + ' عميل';
    
    // سەرفەکان
    document.getElementById('totalExpenses').textContent = formatNumber(dashboardData.totalExpenses) + ' دينار';
    
    // ئاماری هەفتە
    document.getElementById('weekSales').textContent = formatNumber(dashboardData.weekSales) + ' دينار';
    document.getElementById('weekPurchases').textContent = formatNumber(dashboardData.weekPurchases) + ' دينار';
    document.getElementById('weekDifference').textContent = formatNumber(dashboardData.weekDifference) + ' دينار';
    
    // ئاماری ڕۆژ
    document.getElementById('todaySales').textContent = formatNumber(dashboardData.todaySales) + ' دينار';
    document.getElementById('todayPurchases').textContent = formatNumber(dashboardData.todayPurchases) + ' دينار';
    document.getElementById('todayDifference').textContent = formatNumber(dashboardData.todayDifference) + ' دينار';
}

// لیستی فرۆشتنی دوایین نوێ بکەرەوە
function updateRecentSales(sales) {
    const tableBody = document.getElementById('recentSalesTable');
    tableBody.innerHTML = '';
    
    // پێنج فرۆشتنی کۆتایی
    const recentSales = sales.slice(-5).reverse();
    
    recentSales.forEach(sale => {
        const row = document.createElement('tr');
        row.className = 'sales-item-added';
        
        row.innerHTML = `
            <td>فاتورة #${sale.id}</td>
            <td>${formatDate(sale.date)}</td>
            <td>${sale.customer}</td>
            <td><strong>${formatNumber(sale.total)} دينار</strong></td>
            <td>
                <span class="payment-type ${sale.type === 'نقدي' ? 'payment-cash' : 'payment-credit'}">
                    ${sale.type}
                </span>
            </td>
            <td>
                <span class="status-badge status-completed">مكتمل</span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// نمایش ڕێکەوت و کات
function updateDateTime() {
    const now = new Date();
    
    // ڕۆژ و مانگ و ساڵ
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('ar-IQ', options);
    document.getElementById('currentDate').textContent = dateString;
    document.getElementById('todayDate').textContent = now.toLocaleDateString('ar-IQ');
    
    // کات
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('ar-IQ', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // نوێکردنەوەی خۆکار
    setTimeout(updateDateTime, 60000); // هەر خولەکێک
}

// دروستکردنی چارتەکان
function initializeCharts() {
    // چارتی فرۆشتن
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
            datasets: [{
                label: 'المبيعات',
                data: [650000, 590000, 800000, 810000, 560000, 550000, 900000],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'المشتريات',
                data: [450000, 480000, 400000, 510000, 420000, 380000, 470000],
                borderColor: '#f72585',
                backgroundColor: 'rgba(247, 37, 133, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Cairo'
                        }
                    }
                }
            },
            scales: {
                y: {
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
    
    // چارتی کاڵاکان
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    const productsChart = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: ['هواتف', 'لابتوبات', 'سماعات', 'شواحن', 'إكسسوارات'],
            datasets: [{
                data: [35, 25, 15, 10, 15],
                backgroundColor: [
                    '#4361ee',
                    '#3a0ca3',
                    '#4cc9f0',
                    '#f72585',
                    '#7209b7'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Cairo'
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

// داتای نموونەیی داشبۆرد
function initializeSampleDashboardData() {
    const dashboardData = {
        totalSales: 4850000,
        totalPurchases: 3250000,
        salesChange: 12.5,
        purchaseChange: -8.3,
        totalExpenses: 450000,
        weekSales: 1250000,
        weekPurchases: 850000,
        weekDifference: 400000,
        todaySales: 185000,
        todayPurchases: 120000,
        todayDifference: 65000
    };
    
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
}

// دەستکاری کردنەوە
function setupDashboardEventListeners() {
    // فیلتەری هەفتە
    const weekFilter = document.getElementById('weekFilter');
    if (weekFilter) {
        weekFilter.addEventListener('change', function() {
            // داتاکانی هەفتە نوێ بکەرەوە بەپێی هەڵبژاردە
            updateWeekStats(this.value);
        });
    }
    
    // فیلتەری چارت
    const chartFilter = document.getElementById('chartFilter');
    if (chartFilter) {
        chartFilter.addEventListener('change', function() {
            // چارت نوێ بکەرەوە بەپێی هەڵبژاردە
            updateChartView(this.value);
        });
    }
    
    // چاپی داشبۆرد
    window.printDashboard = function() {
        showNotification('جاري طباعة تقرير لوحة التحكم', 'info');
        setTimeout(() => {
            window.print();
        }, 1000);
    };
    
    // پڕکردنەوەی پەڕە
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
}

// نوێکردنەوەی ئاماری هەفتە
function updateWeekStats(filter) {
    const dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || getDefaultDashboardData();
    
    let weekSales = dashboardData.weekSales;
    let weekPurchases = dashboardData.weekPurchases;
    
    if (filter === 'last_week') {
        // داتای هەفتەی پێشوو
        weekSales = Math.round(weekSales * 0.85);
        weekPurchases = Math.round(weekPurchases * 0.9);
    }
    
    const weekDifference = weekSales - weekPurchases;
    
    // نمایشی داتاکان نوێ بکەرەوە
    document.getElementById('weekSales').textContent = formatNumber(weekSales) + ' دينار';
    document.getElementById('weekPurchases').textContent = formatNumber(weekPurchases) + ' دينار';
    document.getElementById('weekDifference').textContent = formatNumber(weekDifference) + ' دينار';
    
    showNotification('تم تحديث إحصائيات الأسبوع', 'success');
}

// نوێکردنەوەی چارت
function updateChartView(viewType) {
    showNotification('جاري تحديث الرسم البياني', 'info');
    
    // لەم نموونەدا تەنها نمایشە
    // لە ڕیالی دەبێت داتاکانی چارت گۆڕدرێن
}

// پڕکردنەوەی پەڕە
function toggleFullscreen() {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// فەنکشنە یارمەتیدەرەکان
function getDefaultDashboardData() {
    return {
        totalSales: 0,
        totalPurchases: 0,
        salesChange: 0,
        purchaseChange: 0,
        totalExpenses: 0,
        weekSales: 0,
        weekPurchases: 0,
        weekDifference: 0,
        todaySales: 0,
        todayPurchases: 0,
        todayDifference: 0
    };
}

function getDefaultSalesData() {
    return {
        sales: [],
        products: [],
        customers: []
    };
}

function formatNumber(num) {
    return new Intl.NumberFormat('ar-IQ').format(num);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ');
}