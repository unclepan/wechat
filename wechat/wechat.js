'use strict'

const request = require('request'); // request 是一个发送http请求的库
const fs = require('fs');
const _ = require('lodash');

const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: `${prefix}token?grant_type=client_credential`,
    temporary: {
        upload: `${prefix}media/upload?`,
    },
    permanent: {
        upload: `${prefix}material/add_material?`, // 其他类型永久素材
        uploadNews: `${prefix}material/add_news?`, // 永久图文素材
        uploadNewsPic: `${prefix}media/uploadimg?`, // 图文消息内的图片获取URL
    }
};

function Wechat(opts) {
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.fetchAccessToken();
};

Wechat.prototype.fetchAccessToken = function() {
    if(this.access_token && this.expires_in){
       if(this.isValidAccessToken(this)){
            return Promise.resolve(this);
       } 
    }
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
        return Promise.resolve(data);
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

Wechat.prototype.uploadtTemporaryMaterial = function(type, filepath) { // 新增临时素材
    const that = this;
    const form = {
        media: fs.createReadStream(filepath)
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`;
            request({method: 'POST', url, formData: form, json: true}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('upload temporary material fails');
                    }
                }
            });
        })
        .catch((error) => {
            console.log(error.message);
        });
    })
    .catch((error) => {
        console.log(error.message);
    });
}

Wechat.prototype.uploadtPermanentMaterial = function(type, material, permanent) { // 新增永久素材
    const that = this;
    let form = {};
    let uploadUrl = `${api.permanent.upload}type=${type}&`;
    _.extend(form, permanent);
    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }
    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    } else {
        form.media = fs.createReadStream(material);
    }
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${uploadUrl}access_token=${data.access_token}`;
            form.access_token = data.access_token;
            const options = {
                method: 'POST', 
                url: url, 
                json: true
            };
            if (type === 'news') {
                options.body = form;
            } else {
                options.formData = form;
            }
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('upload permanent material fails');
                    }
                }
            });
        })
        .catch((error) => {
            console.log(error.message);
        });
    })
    .catch((error) => {
        console.log(error.message);
    });
}
module.exports = Wechat;