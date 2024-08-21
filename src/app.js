const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');

// Inisialisasi aplikasi Koa
const app = new Koa();

// Middleware untuk menyajikan file statis
app.use(serve(path.join(__dirname, '../public')));


module.exports = app
