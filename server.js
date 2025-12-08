const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const dbPath = path.join(__dirname, 'data', 'database.json');

// تهيئة قاعدة البيانات
if (!fs.existsSync(dbPath)) {
    const initialData = {
        users: [
            { id: 1, username: "admin", password: "farzad1234", role: "admin" }
        ],
        products: [],
        customers: [],
        suppliers: [],
        sales: [],
        purchases: [],
        transactions: []
    };
    
    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

// دوال قراءة/كتابة قاعدة البيانات
function readDB() {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// APIs
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: "اسم المستخدم أو كلمة المرور غير صحيحة" 
        });
    }
});

app.get('/api/products', (req, res) => {
    const db = readDB();
    res.json(db.products);
});

app.post('/api/products', (req, res) => {
    const product = req.body;
    const db = readDB();
    
    product.id = Date.now();
    product.createdAt = new Date().toISOString();
    db.products.push(product);
    writeDB(db);
    
    res.json({ success: true, product });
});

app.post('/api/sales', (req, res) => {
    const sale = req.body;
    const db = readDB();
    
    sale.id = `SALE-${Date.now()}`;
    sale.date = new Date().toISOString();
    sale.total = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // تحديث المخزون
    sale.items.forEach(item => {
        const product = db.products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    
    db.sales.push(sale);
    
    // تسجيل المعاملة
    db.transactions.push({
        id: `TRX-${Date.now()}`,
        type: 'sale',
        amount: sale.total,
        date: sale.date,
        details: `بيع ${sale.items.length} منتجات`,
        customerId: sale.customerId
    });
    
    writeDB(db);
    
    res.json({ 
        success: true, 
        sale,
        invoiceNumber: sale.id 
    });
});

app.get('/api/dashboard/stats', (req, res) => {
    const db = readDB();
    const now = new Date();
    
    // حسابات الإحصائيات
    const monthlySales = db.sales
        .filter(s => new Date(s.date) > new Date(now.getTime() - 30*24*60*60*1000))
        .reduce((sum, s) => sum + s.total, 0);
    
    const weeklySales = db.sales
        .filter(s => new Date(s.date) > new Date(now.getTime() - 7*24*60*60*1000))
        .reduce((sum, s) => sum + s.total, 0);
    
    const dailySales = db.sales
        .filter(s => new Date(s.date).toDateString() === now.toDateString())
        .reduce((sum, s) => sum + s.total, 0);
    
    const totalSales = db.sales.reduce((sum, s) => sum + s.total, 0);
    
    res.json({
        monthlySales,
        weeklySales,
        dailySales,
        totalSales,
        totalProducts: db.products.length,
        totalCustomers: db.customers.length,
        totalSuppliers: db.suppliers.length,
        lowStockProducts: db.products.filter(p => p.stock < 5).length
    });
});

app.listen(PORT, () => {
    console.log(`✅ السيرفر يعمل على http://localhost:${PORT}`);
    console.log(`📁 الواجهة الأمامية: http://localhost:${PORT}/index.html`);
    console.log(`🔐 صفحة الدخول: http://localhost:${PORT}/login.html`);
    console.log(`📊 الداشبورد: http://localhost:${PORT}/dashboard/dashboard.html`);
});
