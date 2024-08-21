const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');

const Router = require("koa-router")

const router = new Router()

// Inisialisasi aplikasi Koa
const app = new Koa();

// Middleware untuk menyajikan file statis
app.use(serve(path.join(__dirname, '../public')));

router.use('/', async (ctx) => {
  ctx.redirect('index.html')
})

router.use('/2.3000.1015851946', async (ctx) => {
  ctx.redirect('2.3000.1015851946.html')
})

app
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = app
