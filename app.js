'use strict'

const Koa = require('koa');
const wechat = require('./wechat/g');
const config = require('./config');

const app = new Koa();
app.use(wechat(config.wechat));
app.listen(1234);
console.log('Listening port:1234 success');