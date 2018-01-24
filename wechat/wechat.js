'use strict'

const request = require('request'); // request 是一个发送http请求的库
const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: `${prefix}token?grant_type=client_credential`,
};
function Wechat(opts) {
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.getAccessToken()
    .then((data) => {
        try {
            data = JSON.parse(data);
        } catch(e) {
            return this.updateAccessToken();
        }
        if(this.isValidAccessToken(data)) {
            return Promise.resolve(data);
        } else {
            return this.updateAccessToken();
        }
    })
    .then((data) => {
        this.access_token = data.access_token;
        this.expires_in = data.expires_in;
        this.saveAccessToken(data);
    })
    .catch((error) => {
        console.log(error.message);
    });
};

Wechat.prototype.isValidAccessToken = function(data) { // 验证票据的方法
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }
    const access_token = data.access_token; // 票据
    const expires_in = data.expires_in; // 过期时间
    const now = (new Date().getTime());
    if(now < expires_in) {
        return true;
    } else {
        return false;
    }
};

Wechat.prototype.updateAccessToken = function(data) { // 更新票据的方法
    const appID = this.appID;
    const appSecret = this.appSecret;
    const url = `${api.accessToken}&appid=${appID}&secret=${appSecret}`;

    return new Promise(function(resolve, reject) {
        request({url: url, json: true}, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const now = new Date().getTime();
                const expires_in = now + (body.expires_in  - 20) * 1000;
                body.expires_in = expires_in;
                resolve(body);
            }
        });
    })
    .catch((error) => {
        console.log(error.message);
    });
}

module.exports = Wechat;