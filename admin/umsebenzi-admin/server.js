const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API = 'http://localhost:5000/api';
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

let adminToken = null;

app.get('/', (req, res) => {
  if (!adminToken) return res.redirect('/login');
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.success) {
      adminToken = data.token;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: data.message });
    }
  } catch (e) {
    res.render('login', { error: 'Connection error' });
  }
});

app.get('/dashboard', async (req, res) => {
  if (!adminToken) return res.redirect('/login');
  try {
    const response = await fetch(`${API}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    res.render('dashboard', { stats: data.stats });
  } catch (e) {
    res.render('dashboard', { stats: {} });
  }
});

app.get('/users', async (req, res) => {
  if (!adminToken) return res.redirect('/login');
  try {
    const response = await fetch(`${API}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    res.render('users', { users: data.users || [] });
  } catch (e) {
    res.render('users', { users: [] });
  }
});

app.get('/pending', async (req, res) => {
  if (!adminToken) return res.redirect('/login');
  try {
    const response = await fetch(`${API}/admin/users/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await response.json();
    res.render('pending', { users: data.users || [] });
  } catch (e) {
    res.render('pending', { users: [] });
  }
});

app.post('/users/:id/approve', async (req, res) => {
  if (!adminToken) return res.redirect('/login');
  await fetch(`${API}/admin/users/${req.params.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'approved' })
  });
  res.redirect('/pending');
});

app.post('/users/:id/suspend', async (req, res) => {
  if (!adminToken) return res.redirect('/login');
  await fetch(`${API}/admin/users/${req.params.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'suspended' })
  });
  res.redirect('/users');
});

app.get('/logout', (req, res) => {
  adminToken = null;
  res.redirect('/login');
});

app.listen(3000, () => console.log('Admin panel running on http://localhost:3000'));
