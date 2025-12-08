/**
 * النظام الرئيسي - JavaScript
 * نظام بيع الإلكترونيات
 */

// ===== التهيئة العامة =====
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    checkLoginStatus();
    setupEventListeners();
    loadDashboardStats();
});

// ===== تهيئة النظام =====
function initializeSystem() {
    console.log('✅ نظام بيع الإلكترونيات يعمل بنجاح');
    
    // تعيين التاريخ الحالي
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const dateString = now.toLocaleDateString('ar-SA', dateOptions);
    const timeString = now.toLocaleTimeString('ar-SA', timeOptions);
    
    // تحديث التاريخ والوقت في الصفحات
    const dateElements = document.querySelectorAll('#currentDate, .current-date');
    dateElements.forEach(el => {
        el.textContent = `${dateString} - ${timeString}`;
    });
    
    // تحديث التاريخ والوقت بشكل حي
    setInterval(() => {
        const currentTime = new Date();
        const currentTimeString = currentTime.toLocaleTimeString('ar-SA', timeOptions);
        
        const timeElements = document.querySelectorAll('.current-time');
        timeElements.forEach(el => {
            el.textContent = currentTimeString;
        });
    }, 1000);
}

// ===== التحقق من حالة تسجيل الدخول =====
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    // إذا كان المستخدم في صفحة الدخول ومُسجل دخول بالفعل
    if (isLoggedIn === 'true' && currentPage.includes('login.html')) {
        window.location.href = 'dashboard/dashboard.html';
    }
    
    // إذا كان المستخدم في صفحات النظام ولم يُسجل دخول
    if (!isLoggedIn && !currentPage.includes('index.html') && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
    }
    
    // عرض اسم المستخدم إذا كان مسجلاً
    if (isLoggedIn === 'true') {
        const username = localStorage.getItem('username') || 'مستخدم';
        const userElements = document.querySelectorAll('.user-name, .username-display');
        userElements.forEach(el => {
            el.textContent = username;
        });
    }
}

// ===== إعداد مستمعي الأحداث =====
function setupEventListeners() {
    // تبديل القائمة الجانبية
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // إغلاق القائمة عند النقر خارجها (للموبايل)
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
    
    // تبديل التبويبات
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId, this);
        });
    });
    
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = '../login.html';
            }
        });
    }
    
    // بحث المنتجات
    const searchInput = document.getElementById('searchProduct');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            searchProducts(this.value);
        }, 300));
    }
    
    // البحث بالضغط على Enter
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('search-input')) {
            searchProducts(e.target.value);
        }
    });
}

// ===== تحميل إحصائيات داشبورد =====
async function loadDashboardStats() {
    const statCards = document.querySelectorAll('.stat-card .stat-value');
    
    if (statCards.length === 0) return;
    
    // إحصائيات افتراضية (ستتم استبدالها بالبيانات الحقيقية من السيرفر)
    const stats = {
        monthSales: 45820,
        monthPurchases: 28450,
        monthDifference: 17370,
        weekSales: 12540,
        weekPurchases: 7230,
        weekDifference: 5310,
        daySales: 2150,
        dayPurchases: 850,
        dayDifference: 1300,
        totalSales: 245670,
        totalPurchases: 187320,
        totalDifference: 58350,
        totalProducts: 1245,
        totalCustomers: 324,
        totalDebt: 12450,
        totalExpenses: 8750
    };
    
    // تحريك الأرقام
    statCards.forEach(card => {
        const statId = card.id;
        if (stats[statId]) {
            animateCounter(card, 0, stats[statId], 1500);
        }
    });
    
    // محاولة جلب البيانات من السيرفر
    try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
            const data = await response.json();
            updateStatsWithRealData(data);
        }
    } catch (error) {
        console.log('⚠️ استخدام البيانات الافتراضية');
    }
}

// ===== تحريك العداد =====
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        // تنسيق الرقم
        element.textContent = formatNumber(value);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

// ===== تنسيق الأرقام =====
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

// ===== تبديل التبويبات =====
function switchTab(tabId, clickedItem) {
    // إزالة النشاط من جميع العناصر
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // إضافة النشاط للعنصر المحدد
    clickedItem.classList.add('active');
    
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    const targetTab = document.getElementById(tabId + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
        
        // تحديث عنوان الصفحة
        updatePageTitle(clickedItem.querySelector('span').textContent);
        
        // تحميل بيانات التبويب إذا لزم الأمر
        loadTabData(tabId);
    }
}

// ===== تحديث عنوان الصفحة =====
function updatePageTitle(title) {
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    if (pageTitle) {
        pageTitle.textContent = title;
    }
    
    // العناوين الفرعية حسب التبويب
    const subtitles = {
        'لوحة التحكم': 'مرحباً بعودتك! إليك نظرة عامة على أداء متجرك.',
        'المبيعات': 'قم بإدارة عمليات البيع والفواتير اليومية.',
        'المخزون': 'إدارة المنتجات والمخزون والباركود.',
        'العملاء': 'إدارة بيانات العملاء والمبيعات والديون.',
        'الموردون': 'إدارة الموردين والمشتريات.',
        'المعاملات': 'سجل المعاملات المالية والتحويلات.',
        'الإعدادات': 'تخصيص إعدادات النظام والمستخدمين.'
    };
    
    if (pageSubtitle && subtitles[title]) {
        pageSubtitle.textContent = subtitles[title];
    }
}

// ===== تحميل بيانات التبويب =====
function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'sales':
            loadSalesData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'customers':
            loadCustomersData();
            break;
        case 'suppliers':
            loadSuppliersData();
            break;
        case 'transactions':
            loadTransactionsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// ===== دالة للانتظار =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== دالات تحميل البيانات (ستتم ملؤها لاحقاً) =====
function loadDashboardData() {
    console.log('📊 تحميل بيانات لوحة التحكم...');
}

function loadSalesData() {
    console.log('🛒 تحميل بيانات المبيعات...');
    initializeSalesSystem();
}

function loadInventoryData() {
    console.log('📦 تحميل بيانات المخزون...');
}

function loadCustomersData() {
    console.log('👥 تحميل بيانات العملاء...');
}

function loadSuppliersData() {
    console.log('🚚 تحميل بيانات الموردين...');
}

function loadTransactionsData() {
    console.log('💰 تحميل بيانات المعاملات...');
}

function loadSettingsData() {
    console.log('⚙️ تحميل الإعدادات...');
}

// ===== نظام المبيعات =====
function initializeSalesSystem() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // بيانات المنتجات الافتراضية
    const products = [
        { id: 1, name: "هاتف سامسونج جالاكسي", price: 1500, category: "هواتف", stock: 10, barcode: "123456789" },
        { id: 2, name: "لابتوب ديل إكس بي إس", price: 3500, category: "لابتوبات", stock: 5, barcode: "987654321" },
        { id: 3, name: "سماعات رأس سوني", price: 250, category: "سماعات", stock: 20, barcode: "456123789" },
        { id: 4, name: "كاميرا كانون EOS", price: 2800, category: "كاميرات", stock: 3, barcode: "789123456" },
        { id: 5, name: "تابلت هواوي ميت باد", price: 1200, category: "تابلتات", stock: 8, barcode: "321654987" },
        { id: 6, name: "سماعة بلوتوث سامسونج", price: 180, category: "سماعات", stock: 15, barcode: "654987321" },
        { id: 7, name: "شاحن متنقل أنكر", price: 120, category: "إكسسوارات", stock: 25, barcode: "147258369" },
        { id: 8, name: "ماوس لاسلكي لوجيتك", price: 85, category: "إكسسوارات", stock: 30, barcode: "369258147" }
    ];
    
    // عرض المنتجات
    displayProducts(products);
    
    // تهيئة السلة
    initializeCart();
}

// ===== عرض المنتجات =====
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.dataset.name = product.name;
        productCard.dataset.price = product.price;
        productCard.dataset.category = product.category;
        
        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-${getProductIcon(product.category)}"></i>
            </div>
            <h4>${product.name}</h4>
            <div class="product-price">${product.price.toLocaleString()} ريال</div>
            <div class="product-category">${product.category}</div>
            <div class="product-stock">المخزون: ${product.stock}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                <i class="fas fa-cart-plus"></i> إضافة للسلة
            </button>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// ===== الحصول على أيقونة المنتج =====
function getProductIcon(category) {
    const icons = {
        'هواتف': 'mobile-alt',
        'لابتوبات': 'laptop',
        'سماعات': 'headphones',
        'كاميرات': 'camera',
        'تابلتات': 'tablet',
        'إكسسوارات': 'keyboard'
    };
    
    return icons[category] || 'box';
}

// ===== البحث عن المنتجات =====
function searchProducts(query) {
    const allProducts = document.querySelectorAll('.product-card');
    
    allProducts.forEach(product => {
        const name = product.dataset.name.toLowerCase();
        const category = product.dataset.category.toLowerCase();
        
        if (name.includes(query.toLowerCase()) || category.includes(query.toLowerCase())) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// ===== نظام السلة =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function initializeCart() {
    updateCartDisplay();
}

function addToCart(id, name, price) {
    // البحث عن المنتج في السلة
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    // حفظ السلة في localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // تحديث العرض
    updateCartDisplay();
    
    // إشعار ناجح
    showNotification('تمت إضافة المنتج إلى السلة', 'success');
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartItems) return;
    
    // تحديث عدد المنتجات
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // عرض عناصر السلة
    if (cart.length === 0) {
        cartItems.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">السلة فارغة</td></tr>';
        if (cartTotal) cartTotal.textContent = '0';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price.toLocaleString()} ريال</td>
                <td>
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           class="quantity-input"
                           data-index="${index}"
                           onchange="updateCartQuantity(${index}, this.value)">
                </td>
                <td>${itemTotal.toLocaleString()} ريال</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartItems.innerHTML = html;
    
    if (cartTotal) {
        cartTotal.textContent = total.toLocaleString();
    }
}

function updateCartQuantity(index, quantity) {
    if (quantity < 1) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = parseInt(quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(index) {
    if (confirm('هل تريد إزالة هذا المنتج من السلة؟')) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification('تم إزالة المنتج من السلة', 'warning');
    }
}

function clearCart() {
    if (confirm('هل تريد تفريغ السلة بالكامل؟')) {
        cart = [];
        localStorage.removeItem('cart');
        updateCartDisplay();
        showNotification('تم تفريغ السلة', 'danger');
    }
}

// ===== الإشعارات =====
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الأنماط
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    // إضافة للصفحة
    document.body.appendChild(notification);
    
    // إزالة تلقائية بعد 3 ثواني
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
    
    // إضافة أنيميشن CSS إذا لم تكن موجودة
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle',
        'danger': 'times-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
        'danger': '#dc2626'
    };
    return colors[type] || '#3b82f6';
}

// ===== دالات مساعدة =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// ===== تصدير الدوال للاستخدام في HTML =====
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;
window.showNotification = showNotification;
window.switchTab = switchTab;
