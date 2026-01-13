const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

// ڕێگەدان بە پەیوەندی لە ڤەرسیڵ
app.use(cors({
  origin: [
    'https://systam-market.vercel.app',
    'https://cashermarkte.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// کۆدی نموونەیی بۆ تێبینی
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // بۆ نموونە: بەکارهێنەرە نموونەییەکان
  const users = [
    { id: 1, username: 'farzad', password: 'farzad1234', name: 'فەرزاد' },
    { id: 2, username: 'admin', password: 'admin123', name: 'ئەدمین' }
  ];
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەە!' });
  }
});

// کۆدی نموونەیی بۆ کەسەکان
let customers = [
  { id: 1, name: "عەلی محەممەد", phone: "07701234567", address: "هەولێر", debt: 50000 },
  { id: 2, name: "حوسێن عەلی", phone: "07707654321", address: "سلێمانی", debt: 25000 }
];

app.get('/api/customers', (req, res) => {
  res.json({ success: true, data: customers });
});

app.post('/api/customers', (req, res) => {
  const newCustomer = {
    id: customers.length + 1,
    ...req.body,
    debt: 0
  };
  customers.push(newCustomer);
  res.json({ success: true, data: newCustomer });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سێرڤێر API لە پۆرت ${PORT} کرایەوە`);
});
