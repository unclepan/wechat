'use strict'

const path = require('path');
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
};

module.exports = config;