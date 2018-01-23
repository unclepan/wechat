'use strict'

const Koa = require('koa');
const path = require('path');
const wechat = require('./wechat/g');
const util = require('./libs/util');
const wechat_file = path.join(__dirname, './config/wechat.txt');

const config = {
    wechat: {
        appID: 'wx9c9d900955c45843',
        appSecret: '3feddff31e20433d7268a577c3b04d11',
        token: 'antcpcomyangpanantcpcom',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken:  function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        }
    }
}
const app = new Koa();
app.use(wechat(config.wechat));
app.listen(1234);
console.log('Listening port:1234 success');