const shopRouter = require('./shop');
const siteRouter = require('./site');
const adminRouter = require('./admin');
const authRouter = require('./auth');
const cartRouter = require('./cart');
const categoryRouter = require('./category');
const orderRouter = require('./order');


function route(app){

    app.use('/orders', orderRouter);
    app.use('/shop', shopRouter);
    app.use('/category', categoryRouter);
    app.use('/admin', adminRouter);
    app.use('/auth', authRouter);
    app.use('/cart', cartRouter);
    app.use('/', siteRouter);

}

module.exports = route;