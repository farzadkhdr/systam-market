// کۆدی پەڕەی فرۆشتن
class SalesSystem {
    constructor() {
        this.cart = [];
        this.products = [];
        this.customers = [];
        this.currentCustomer = null;
        this.currentInvoice = null;
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartCount();
        this.loadSalesHistory();
        this.updateDateTime();
        
        // داتای نموونەیی زیاد بکە ئەگەر بوونی نەبوو
        this.initializeSampleData();
    }
    
    // بارکردنی داتا
    loadData() {
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        this.products = salesData.products;
        this.customers = salesData.customers;
        
        // سەبەتە لە localStorage وەرگرە
        const savedCart = localStorage.getItem('currentCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.renderCart();
        }
    }
    
    // دەستکاری کردنەوە
    setupEventListeners() {
        // گەڕان
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });
        
        // فیلتەری جۆر
        document.getElementById('applyFilter').addEventListener('click', () => {
            this.applyFilter();
        });
        
        // گەڕانی کڕیار
        document.getElementById('customerSearch').addEventListener('input', (e) => {
            this.searchCustomers(e.target.value);
        });
        
        // زیادکردنی بە بڕ
        document.getElementById('discountAmount').addEventListener('input', () => {
            this.calculateTotal();
        });
        
        // جۆری پارەدان
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });
        
        // پارەی نەقد
        document.getElementById('cashAmount').addEventListener('input', () => {
            this.calculateChange();
        });
        
        // دوگمەکان
        document.getElementById('clearCart').addEventListener('click', () => {
            this.clearCart();
        });
        
        document.getElementById('saveDraft').addEventListener('click', () => {
            this.saveDraft();
        });
        
        document.getElementById('checkout').addEventListener('click', () => {
            this.checkout();
        });
        
        // گەڕانی مێژوو
        document.getElementById('invoiceSearch').addEventListener('input', (e) => {
            this.searchInvoices(e.target.value);
        });
        
        // بارکۆد
        document.querySelector('.btn-scan').addEventListener('click', () => {
            this.scanBarcode();
        });
    }
    
    // نیشاندانی کاڵاکان
    renderProducts(filteredProducts = null) {
        const productsGrid = document.getElementById('productsGrid');
        const products = filteredProducts || this.products;
        
        productsGrid.innerHTML = '';
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>لا توجد منتجات</p>
                </div>
            `;
            return;
        }
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = `product-card ${product.quantity === 0 ? 'out-of-stock' : ''}`;
            productCard.dataset.id = product.id;
            
            productCard.innerHTML = `
                <div class="product-image">
                    <i class="fas fa-${this.getProductIcon(product.category)}"></i>
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">${this.formatCurrency(product.price)}</p>
                    <div class="product-quantity">
                        <span>المخزون:</span>
                        <span class="quantity-badge">${product.quantity}</span>
                    </div>
                </div>
                <button class="btn-add-to-cart" ${product.quantity === 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i>
                    أضف للسلة
                </button>
            `;
            
            // زیادکردنی کاڵا بۆ سەبەتە
            const addButton = productCard.querySelector('.btn-add-to-cart');
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addToCart(product);
            });
            
            // کلیک کردن بۆ زانیاری زیاتر
            productCard.addEventListener('click', () => {
                this.showProductDetails(product);
            });
            
            productsGrid.appendChild(productCard);
        });
        
        // ژمارەی کاڵاکان نوێ بکەرەوە
        document.getElementById('productsCount').textContent = `${products.length} منتج`;
    }
    
    // گەڕان بەدوای کاڵا
    searchProducts(query) {
        if (!query.trim()) {
            this.renderProducts();
            return;
        }
        
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.barcode.includes(query)
        );
        
        this.renderProducts(filteredProducts);
    }
    
    // فیلتەری جۆر
    applyFilter() {
        const category = document.getElementById('categoryFilter').value;
        
        if (!category) {
            this.renderProducts();
            return;
        }
        
        const filteredProducts = this.products.filter(product => 
            product.category === category
        );
        
        this.renderProducts(filteredProducts);
    }
    
    // زیادکردنی کاڵا بۆ سەبەتە
    addToCart(product, quantity = 1) {
        // چێکی بەشی بونی کاڵا لە سەبەتە
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // چێکی بڕی بەشی ماوە
            if (existingItem.quantity + quantity > product.quantity) {
                showNotification('الكمية المطلوبة غير متوفرة في المخزون', 'error');
                return;
            }
            existingItem.quantity += quantity;
        } else {
            // چێکی بڕی بەشی ماوە
            if (quantity > product.quantity) {
                showNotification('الكمية المطلوبة غير متوفرة في المخزون', 'error');
                return;
            }
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        // سەبەتە نوێ بکەرەوە
        this.renderCart();
        
        // ژمارەی سەبەتە نوێ بکەرەوە
        this.updateCartCount();
        
        // هەڵگرتنی سەبەتە
        this.saveCart();
        
        // نمایشی پیامی سەرکەوتن
        showNotification(`تم إضافة ${product.name} إلى السلة`, 'success');
    }
    
    // نیشاندانی کاڵاکانی سەبەتە
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.querySelector('.empty-cart');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>السلة فارغة</p>
                    <small>أضف منتجات من القائمة اليسرى</small>
                </div>
            `;
            return;
        }
        
        if (emptyCart) {
            emptyCart.remove();
        }
        
        cartItems.innerHTML = '';
        
        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            
            const itemTotal = item.price * item.quantity;
            
            cartItem.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.quantity}">
                        <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="item-price">${this.formatCurrency(item.price)}</div>
                <div class="item-total">${this.formatCurrency(itemTotal)}</div>
                <button class="btn-remove"><i class="fas fa-times"></i></button>
            `;
            
            // دەستکاری بڕ
            const decreaseBtn = cartItem.querySelector('.decrease');
            const increaseBtn = cartItem.querySelector('.increase');
            const quantityInput = cartItem.querySelector('.quantity-input');
            const removeBtn = cartItem.querySelector('.btn-remove');
            
            decreaseBtn.addEventListener('click', () => {
                this.updateQuantity(item.id, -1);
            });
            
            increaseBtn.addEventListener('click', () => {
                this.updateQuantity(item.id, 1);
            });
            
            quantityInput.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0 && newQuantity <= item.quantity) {
                    this.updateQuantity(item.id, newQuantity - item.quantity);
                } else {
                    e.target.value = item.quantity;
                }
            });
            
            removeBtn.addEventListener('click', () => {
                this.removeFromCart(item.id);
            });
            
            cartItems.appendChild(cartItem);
        });
        
        // کۆی گشتی نوێ بکەرەوە
        this.calculateTotal();
    }
    
    // گۆڕینی بڕی کاڵا لە سەبەتە
    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        const originalProduct = this.products.find(p => p.id === productId);
        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }
        
        if (newQuantity > originalProduct.quantity) {
            showNotification('الكمية المطلوبة غير متوفرة في المخزون', 'error');
            return;
        }
        
        item.quantity = newQuantity;
        this.renderCart();
        this.saveCart();
    }
    
    // لابردنی کاڵا لە سەبەتە
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.renderCart();
        this.updateCartCount();
        this.saveCart();
        showNotification('تم حذف المنتج من السلة', 'info');
    }
    
    // پاککردنەوەی سەبەتە
    clearCart() {
        if (this.cart.length === 0) {
            showNotification('السلة فارغة بالفعل', 'info');
            return;
        }
        
        if (confirm('هل تريد تفريغ السلة بالكامل؟')) {
            this.cart = [];
            this.renderCart();
            this.updateCartCount();
            this.saveCart();
            showNotification('تم تفريغ السلة', 'success');
        }
    }
    
    // ژمێریاری کۆی گشتی
    calculateTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountInput = document.getElementById('discountAmount');
        const discountType = document.getElementById('discountType').value;
        let discount = parseFloat(discountInput.value) || 0;
        
        // دەستکاری بەش
        if (discountType === 'percent') {
            discount = (subtotal * discount) / 100;
        }
        
        const total = subtotal - discount;
        
        // نمایشی ژمارەکان
        document.getElementById('subtotalAmount').textContent = this.formatCurrency(subtotal);
        document.getElementById('cartTotalAmount').textContent = this.formatCurrency(total);
        document.getElementById('totalAmount').textContent = this.formatCurrency(total);
        
        // پارەی قەرز
        document.getElementById('newDebtAmount').textContent = this.formatCurrency(total);
        
        // پارەی گۆڕاو
        this.calculateChange();
        
        return total;
    }
    
    // ژمێریاری پارەی گۆڕاو
    calculateChange() {
        const total = this.calculateTotal();
        const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
        const change = cashAmount - total;
        
        document.getElementById('cashChange').textContent = this.formatCurrency(Math.max(change, 0));
    }
    
    // گەڕان بەدوای کڕیار
    searchCustomers(query) {
        const suggestions = document.getElementById('customerSuggestions');
        
        if (!query.trim()) {
            suggestions.style.display = 'none';
            return;
        }
        
        const filteredCustomers = this.customers.filter(customer =>
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query)
        );
        
        suggestions.innerHTML = '';
        
        if (filteredCustomers.length === 0) {
            suggestions.innerHTML = '<div class="customer-suggestion">لا توجد نتائج</div>';
        } else {
            filteredCustomers.forEach(customer => {
                const div = document.createElement('div');
                div.className = 'customer-suggestion';
                div.textContent = `${customer.name} - ${customer.phone}`;
                div.dataset.id = customer.id;
                
                div.addEventListener('click', () => {
                    this.selectCustomer(customer);
                    suggestions.style.display = 'none';
                    document.getElementById('customerSearch').value = '';
                });
                
                suggestions.appendChild(div);
            });
        }
        
        suggestions.style.display = 'block';
    }
    
    // هەڵبژاردنی کڕیار
    selectCustomer(customer) {
        this.currentCustomer = customer;
        
        document.getElementById('customerName').textContent = customer.name;
        document.getElementById('previousDebt').textContent = this.formatCurrency(customer.debt);
        
        // نمایشی زانیاری کڕیار
        const customerInfo = document.getElementById('customerInfo');
        customerInfo.style.display = 'block';
        
        showNotification(`تم تحديد العميل: ${customer.name}`, 'success');
    }
    
    // مامەڵەکردن لەگەڵ گۆڕانی جۆری پارەدان
    handlePaymentMethodChange(method) {
        const cashPayment = document.getElementById('cashPayment');
        const creditPayment = document.getElementById('creditPayment');
        
        if (method === 'cash' || method === 'mixed') {
            cashPayment.style.display = 'block';
            creditPayment.style.display = 'none';
        } else if (method === 'credit') {
            cashPayment.style.display = 'none';
            creditPayment.style.display = 'block';
        }
    }
    
    // تەواوکردنی فرۆشتن
    checkout() {
        if (this.cart.length === 0) {
            showNotification('السلة فارغة، أضف منتجات أولاً', 'error');
            return;
        }
        
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const total = this.calculateTotal();
        
        // چێکی پارەدان
        if (paymentMethod === 'cash' || paymentMethod === 'mixed') {
            const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
            if (cashAmount < total) {
                showNotification('المبلغ المدفوع غير كافي', 'error');
                return;
            }
        }
        
        // دروستکردنی فاکتوورە
        this.currentInvoice = this.createInvoice(paymentMethod, total);
        
        // نوێکردنەوەی بەشی کاڵاکان
        this.updateInventory();
        
        // نوێکردنەوەی قەرزی کڕیار
        this.updateCustomerDebt();
        
        // زیادکردنی فاکتوورە بۆ مێژوو
        this.addToSalesHistory(this.currentInvoice);
        
        // نمایشی مۆدالی چاپ
        this.showPrintModal();
        
        showNotification('تم إتمام عملية البيع بنجاح', 'success');
    }
    
    // دروستکردنی فاکتوورە
    createInvoice(paymentMethod, total) {
        const invoice = {
            id: this.generateInvoiceId(),
            date: new Date().toISOString(),
            customer: this.currentCustomer ? this.currentCustomer.name : 'زبون جديد',
            customerId: this.currentCustomer ? this.currentCustomer.id : null,
            items: [...this.cart],
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: parseFloat(document.getElementById('discountAmount').value) || 0,
            discountType: document.getElementById('discountType').value,
            total: total,
            paymentMethod: paymentMethod,
            cashAmount: parseFloat(document.getElementById('cashAmount').value) || 0,
            change: document.getElementById('cashChange').textContent,
            previousDebt: this.currentCustomer ? this.currentCustomer.debt : 0,
            newDebt: paymentMethod === 'credit' ? total : 0
        };
        
        return invoice;
    }
    
    // نوێکردنەوەی بەشی کاڵاکان
    updateInventory() {
        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.id);
            if (product) {
                product.quantity -= cartItem.quantity;
            }
        });
        
        // هەڵگرتنی داتاکانی نوێ
        this.saveSalesData();
        
        // نوێکردنەوەی لیستی کاڵاکان
        this.renderProducts();
    }
    
    // نوێکردنەوەی قەرزی کڕیار
    updateCustomerDebt() {
        if (!this.currentCustomer) return;
        
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (paymentMethod === 'credit') {
            this.currentCustomer.debt += this.currentInvoice.total;
        } else if (paymentMethod === 'mixed') {
            // لەم نموونەدا، پارەی نەقد لە قەرزەکە دەکەم بە کەم
            const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
            if (cashAmount < this.currentInvoice.total) {
                this.currentCustomer.debt += (this.currentInvoice.total - cashAmount);
            }
        }
        
        // هەڵگرتنی داتاکانی نوێ
        this.saveSalesData();
    }
    
    // زیادکردنی فاکتوورە بۆ مێژوو
    addToSalesHistory(invoice) {
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        salesData.sales.push(invoice);
        localStorage.setItem('salesData', JSON.stringify(salesData));
        
        // نوێکردنەوەی لیستی مێژوو
        this.loadSalesHistory();
    }
    
    // بارکردنی مێژووی فرۆشتن
    loadSalesHistory(searchQuery = '') {
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        let sales = salesData.sales || [];
        
        // گەڕان
        if (searchQuery) {
            sales = sales.filter(sale => 
                sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // پێچانەوەی ڕێک
        sales = sales.reverse();
        
        // نیشاندانی مێژوو
        this.renderSalesHistory(sales);
    }
    
    // نیشاندانی مێژووی فرۆشتن
    renderSalesHistory(sales) {
        const tableBody = document.getElementById('salesHistoryTable');
        tableBody.innerHTML = '';
        
        if (sales.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">لا توجد فواتير</td>
                </tr>
            `;
            return;
        }
        
        // تەنها 20 فاکتوورەی کۆتایی پیشان بدە
        const recentSales = sales.slice(0, 20);
        
        recentSales.forEach(sale => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${this.formatDate(sale.date)}</td>
                <td>${sale.customer}</td>
                <td>${sale.items.length}</td>
                <td>${this.formatCurrency(sale.total)}</td>
                <td>
                    <span class="payment-type payment-${sale.paymentMethod === 'نقدي' ? 'cash' : 'credit'}">
                        ${sale.paymentMethod === 'cash' ? 'نقدي' : sale.paymentMethod === 'credit' ? 'دين' : 'مختلط'}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-completed">مكتمل</span>
                </td>
                <td>
                    <button class="btn-action btn-view" onclick="salesSystem.viewInvoice('${sale.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="salesSystem.editInvoice('${sale.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="salesSystem.deleteInvoice('${sale.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // ژمارەی فاکتوورەکان نوێ بکەرەوە
        document.getElementById('invoicesCount').textContent = sales.length;
        
        // کۆی فرۆشتی ڕۆژ نوێ بکەرەوە
        this.updateTodaySales();
    }
    
    // گەڕان بەدوای فاکتوورە
    searchInvoices(query) {
        this.loadSalesHistory(query);
    }
    
    // بینینی فاکتوورە
    viewInvoice(invoiceId) {
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        const invoice = salesData.sales.find(s => s.id === invoiceId);
        
        if (!invoice) {
            showNotification('الفاتورة غير موجودة', 'error');
            return;
        }
        
        this.showInvoiceModal(invoice);
    }
    
    // دەستکاری فاکتوورە
    editInvoice(invoiceId) {
        showNotification('هذه الميزة قيد التطوير', 'info');
    }
    
    // سڕینەوەی فاکتوورە
    deleteInvoice(invoiceId) {
        if (!confirm('هل تريد حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }
        
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        salesData.sales = salesData.sales.filter(s => s.id !== invoiceId);
        localStorage.setItem('salesData', JSON.stringify(salesData));
        
        // نوێکردنەوەی لیست
        this.loadSalesHistory();
        
        showNotification('تم حذف الفاتورة', 'success');
    }
    
    // بارکۆد
    scanBarcode() {
        showNotification('جارٍ تشغيل ماسح الباركود...', 'info');
        
        // لەم نموونەدا نمایشە
        // لە ڕیالی دەبێت API بارکۆد بەکاربهێنرێت
        setTimeout(() => {
            const barcode = prompt('أدخل رقم الباركود يدوياً:');
            if (barcode) {
                this.searchProducts(barcode);
            }
        }, 1000);
    }
    
    // پاشەکەوتکردنی پاشخست
    saveDraft() {
        if (this.cart.length === 0) {
            showNotification('السلة فارغة، أضف منتجات أولاً', 'error');
            return;
        }
        
        localStorage.setItem('cartDraft', JSON.stringify({
            cart: this.cart,
            customer: this.currentCustomer,
            timestamp: new Date().toISOString()
        }));
        
        showNotification('تم حفظ السلة كمسودة', 'success');
    }
    
    // پاشەکەوتکردنی سەبەتە
    saveCart() {
        localStorage.setItem('currentCart', JSON.stringify(this.cart));
    }
    
    // پاشەکەوتکردنی داتاکان
    saveSalesData() {
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        salesData.products = this.products;
        salesData.customers = this.customers;
        localStorage.setItem('salesData', JSON.stringify(salesData));
    }
    
    // نوێکردنەوەی ژمارەی سەبەتە
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    }
    
    // نوێکردنەوەی کۆی فرۆشتی ڕۆژ
    updateTodaySales() {
        const salesData = JSON.parse(localStorage.getItem('salesData')) || this.getDefaultSalesData();
        const today = new Date().toDateString();
        const todaySales = (salesData.sales || [])
            .filter(sale => new Date(sale.date).toDateString() === today)
            .reduce((sum, sale) => sum + sale.total, 0);
        
        document.getElementById('todaySalesTotal').textContent = this.formatCurrency(todaySales);
    }
    
    // نمایشی مۆدالی چاپ
    showPrintModal() {
        document.getElementById('printModal').classList.add('show');
    }
    
    // نمایشی مۆدالی فاکتوورە
    showInvoiceModal(invoice) {
        const modalContent = document.getElementById('invoiceContent');
        
        modalContent.innerHTML = `
            <div class="invoice-header">
                <h2>فاتورة بيع</h2>
                <p>نظام بيع الإلكترونيات</p>
                <p>${this.formatDate(invoice.date)} | ${invoice.id}</p>
            </div>
            
            <div class="invoice-info">
                <div class="invoice-details">
                    <h4>تفاصيل الفاتورة</h4>
                    <p><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
                    <p><strong>التاريخ:</strong> ${this.formatDate(invoice.date)}</p>
                    <p><strong>طريقة الدفع:</strong> ${invoice.paymentMethod === 'cash' ? 'نقدي' : invoice.paymentMethod === 'credit' ? 'دين' : 'مختلط'}</p>
                </div>
                <div class="customer-details">
                    <h4>بيانات العميل</h4>
                    <p><strong>الاسم:</strong> ${invoice.customer}</p>
                    <p><strong>الدين السابق:</strong> ${this.formatCurrency(invoice.previousDebt)}</p>
                    ${invoice.newDebt > 0 ? `<p><strong>الدين الجديد:</strong> ${this.formatCurrency(invoice.newDebt)}</p>` : ''}
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${this.formatCurrency(item.price)}</td>
                            <td>${this.formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="invoice-total">
                <div class="total-row">
                    <span>المجموع الفرعي:</span>
                    <span>${this.formatCurrency(invoice.subtotal)}</span>
                </div>
                ${invoice.discount > 0 ? `
                    <div class="total-row">
                        <span>الخصم:</span>
                        <span>${this.formatCurrency(invoice.discount)} ${invoice.discountType === 'percent' ? '%' : 'دينار'}</span>
                    </div>
                ` : ''}
                <div class="total-row grand-total">
                    <span>الإجمالي:</span>
                    <span>${this.formatCurrency(invoice.total)}</span>
                </div>
            </div>
            
            <div class="invoice-footer">
                <p>شكراً لتعاملكم معنا</p>
                <p>للاستفسار: 07701234567</p>
            </div>
            
            <div class="signature-section">
                <div class="signature">
                    <p>توقيع البائع</p>
                    <div class="signature-line"></div>
                </div>
                <div class="signature">
                    <p>توقيع العميل</p>
                    <div class="signature-line"></div>
                </div>
            </div>
        `;
        
        document.getElementById('invoiceModal').classList.add('show');
    }
    
    // فەنکشنە یارمەتیدەرەکان
    generateInvoiceId() {
        const now = new Date();
        const year = now.getFullYear().toString().substr(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `INV-${year}${month}${day}-${random}`;
    }
    
    getProductIcon(category) {
        const icons = {
            'هواتف': 'mobile-alt',
            'لابتوبات': 'laptop',
            'سماعات': 'headphones',
            'شواحن': 'bolt',
            'إكسسوارات': 'plug'
        };
        return icons[category] || 'box';
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    updateDateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('ar-IQ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('currentDate').textContent = dateString;
    }
    
    getDefaultSalesData() {
        return {
            sales: [],
            products: [
                {
                    id: 1,
                    name: 'هاتف سامسونج جالاكسي S23',
                    price: 1500000,
                    quantity: 10,
                    category: 'هواتف',
                    barcode: '8806092223641'
                },
                {
                    id: 2,
                    name: 'لابتوب ديل اكس بي اس 15',
                    price: 4500000,
                    quantity: 5,
                    category: 'لابتوبات',
                    barcode: '5391519400031'
                },
                {
                    id: 3,
                    name: 'سماعات ايربودز ماكس',
                    price: 250000,
                    quantity: 20,
                    category: 'سماعات',
                    barcode: '190198034432'
                },
                {
                    id: 4,
                    name: 'شاحن سريع 65 واط',
                    price: 35000,
                    quantity: 30,
                    category: 'شواحن',
                    barcode: '6942698512390'
                },
                {
                    id: 5,
                    name: 'حافظة هواتف سليكون',
                    price: 15000,
                    quantity: 50,
                    category: 'إكسسوارات',
                    barcode: '6921734956102'
                }
            ],
            customers: [
                {
                    id: 1,
                    name: 'علي أحمد',
                    phone: '07701234567',
                    debt: 50000
                },
                {
                    id: 2,
                    name: 'محمد حسن',
                    phone: '07702345678',
                    debt: 180000
                },
                {
                    id: 3,
                    name: 'حسين كريم',
                    phone: '07703456789',
                    debt: 0
                }
            ]
        };
    }
    
    initializeSampleData() {
        if (!localStorage.getItem('salesData')) {
            localStorage.setItem('salesData', JSON.stringify(this.getDefaultSalesData()));
            this.loadData();
        }
    }
}

// دروستکردنی نموونە و دەستپێکردن
let salesSystem;

document.addEventListener('DOMContentLoaded', function() {
    salesSystem = new SalesSystem();
    
    // زیادکردن بۆ گەردوونی بۆ ئەوەی لە HTML بەکاربهێنرێت
    window.salesSystem = salesSystem;
});

// فەنکشنەکانی مۆدال
function closePrintModal() {
    document.getElementById('printModal').classList.remove('show');
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.remove('show');
}

function printReceipt(type) {
    if (!salesSystem.currentInvoice) {
        showNotification('لا توجد فاتورة للطباعة', 'error');
        return;
    }
    
    closePrintModal();
    
    setTimeout(() => {
        if (type === 'small') {
            printSmallReceipt();
        } else {
            printA4Invoice();
        }
    }, 500);
}

function printSmallReceipt() {
    const invoice = salesSystem.currentInvoice;
    
    const printContent = `
        <div style="font-family: 'Cairo', sans-serif; width: 80mm; padding: 10px; direction: rtl;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4361ee;">فاتورة بيع</h3>
                <p style="margin: 5px 0; font-size: 12px;">نظام بيع الإلكترونيات</p>
                <p style="margin: 5px 0; font-size: 12px;">${salesSystem.formatDate(invoice.date)}</p>
                <p style="margin: 5px 0; font-size: 12px;">${invoice.id}</p>
            </div>
            
            <div style="margin-bottom: 15px; font-size: 12px;">
                <p style="margin: 5px 0;"><strong>العميل:</strong> ${invoice.customer}</p>
                <p style="margin: 5px 0;"><strong>طريقة الدفع:</strong> ${invoice.paymentMethod === 'cash' ? 'نقدي' : invoice.paymentMethod === 'credit' ? 'دين' : 'مختلط'}</p>
            </div>
            
            <hr style="border: none; border-top: 1px dashed #ccc; margin: 10px 0;">
            
            <div style="margin-bottom: 15px;">
                ${invoice.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${salesSystem.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            
            <hr style="border: none; border-top: 1px dashed #ccc; margin: 10px 0;">
            
            <div style="font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>المجموع:</span>
                    <span>${salesSystem.formatCurrency(invoice.subtotal)}</span>
                </div>
                ${invoice.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>الخصم:</span>
                        <span>${salesSystem.formatCurrency(invoice.discount)}</span>
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px;">
                    <span>الإجمالي:</span>
                    <span>${salesSystem.formatCurrency(invoice.total)}</span>
                </div>
            </div>
            
            <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">
            
            <div style="text-align: center; font-size: 11px; color: #666;">
                <p style="margin: 5px 0;">شكراً لتعاملكم معنا</p>
                <p style="margin: 5px 0;">للاستفسار: 07701234567</p>
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة إيصال</title>
            <style>
                @media print {
                    @page { size: 80mm auto; margin: 0; }
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${printContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function printA4Invoice() {
    closeInvoiceModal();
    
    setTimeout(() => {
        const printContent = document.getElementById('invoiceContent').innerHTML;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة فاتورة</title>
                <style>
                    body { 
                        font-family: 'Cairo', sans-serif; 
                        direction: rtl; 
                        padding: 20px; 
                        margin: 0;
                    }
                    @media print {
                        @page { size: A4; margin: 15mm; }
                        body { margin: 0; padding: 0; }
                    }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .invoice-header h2 { color: #4361ee; }
                    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .invoice-items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .invoice-items th, .invoice-items td { padding: 10px; border: 1px solid #ddd; text-align: right; }
                    .invoice-total { text-align: left; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .grand-total { font-size: 18px; font-weight: bold; color: #4361ee; }
                    .invoice-footer { text-align: center; margin-top: 50px; color: #666; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 100px; }
                    .signature { text-align: center; width: 200px; }
                    .signature-line { width: 100%; height: 1px; background: #000; margin: 40px 0 5px 0; }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }, 500);
}

function printInvoice() {
    if (salesSystem.currentInvoice) {
        salesSystem.showPrintModal();
    } else {
        showNotification('قم بإتمام عملية بيع أولاً', 'info');
    }
}

function printCurrentInvoice() {
    printA4Invoice();
}

// فەنکشنی نوتیفیکەیشن
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    const container = document.getElementById('notificationContainer') || document.body;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}