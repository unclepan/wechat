'use strict'

const request = require('request'); // request 是一个发送http请求的库
const fs = require('fs');
const _ = require('lodash');
const api = require('./api');

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

Wechat.prototype.uploadTemporaryMaterial = function(type, filepath) { // 新增临时素材
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

Wechat.prototype.uploadPermanentMaterial = function(type, material, permanent) { // 新增永久素材
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

Wechat.prototype.fetchTemporaryMaterial = function(mediaId, type, permanent) { // 获取临时素材
    const that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            let url = `${api.temporary.fetch}access_token=${data.access_token}&media_id=${mediaId}`;
            if (type === 'video') {
                url = url.replace('https://', 'http://');
            }
            request({method: 'GET', url, json: true}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取临时素材出错');
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

Wechat.prototype.fetchPermanentMaterial = function(mediaId, type, permanent) { // 获取永久素材
    const that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            let url = `${api.permanent.fetch}access_token=${data.access_token}`;
            if (type === 'video') {
                url = url.replace('https://', 'http://');
            }
            const form = {
                access_token: data.access_token,
                media_id: mediaId,
            };
            request({method: 'POST', url, body: form, json: true}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取永久素材出错');
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

Wechat.prototype.deletePermanentMaterial = function(mediaId) { // 删除永久素材
    const that = this;
    const form = {
        media: mediaId,
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.permanent.del}access_token=${data.access_token}&media_id=${mediaId}`;
            request({method: 'POST', url, body: form, json: true}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('删除永久素材出错');
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

Wechat.prototype.updatePermanentMaterial = function(mediaId, news) { // 修改永久图文素材
    const that = this;
    const form = {
        media: mediaId,
    };
    _.extend(form, news);
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.permanent.update}access_token=${data.access_token}&media_id=${mediaId}`;
            request({method: 'POST', url, body: form, json: true}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('修改永久图文素材出错');
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

Wechat.prototype.countPermanentMaterial = function() { // 获取素材总数
    const that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.permanent.count}access_token=${data.access_token}`;
            request({method: 'GET', url, json: true}, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取素材总数出错');
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

Wechat.prototype.batchPermanentMaterial = function(options) { // 获取素材列表
    const that = this;
    options.type = options.type || 'image';
    options.offset = options.offset || 0;
    options.count = options.count || 10;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.permanent.batch}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:options, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取素材列表出错');
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

Wechat.prototype.createTags = function(name) { // 创建标签
    const that = this;
    const options = {
        tag: {
            name,
        }, 
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.create}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:options, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('创建标签出错');
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

Wechat.prototype.getTags = function() { // 获取标签
    const that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.get}access_token=${data.access_token}`;
            request({ method: 'GET', url, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取标签出错');
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

Wechat.prototype.updateTags = function(id, name) { // 编辑标签
    const that = this;
    const form = {
        tag: {
            id,
            name, 
        }, 
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.update}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:form, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('创建标签出错');
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

Wechat.prototype.deleteTags = function(id) { // 删除标签
    const that = this;
    const form = {
        tag: {
            id,
        }, 
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.delete}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:form, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('创建标签出错');
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

Wechat.prototype.getUsersTags = function(tagid, openid = '') { // 获取标签下粉丝列表
    const that = this;
    const form = {
        tagid,
        next_openid: openid, //第一个拉取的OPENID，不填默认从头开始拉取
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.getUsers}access_token=${data.access_token}`;
            request({ method: 'GET', url, body:form, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取标签下粉丝列表出错');
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

Wechat.prototype.batchtaggingTags = function(openidList, tagid) { // 批量为用户打标签
    const that = this;
    const form = {
        openid_list: openidList, //粉丝列表
        tagid,
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.batchtagging}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:form, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('批量为用户打标签出错');
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

Wechat.prototype.batchuntaggingTags = function(openidList, tagid) { // 批量为用户取消标签
    const that = this;
    const form = {
        openid_list: openidList, //粉丝列表
        tagid,
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.batchuntagging}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:form, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('批量为用户取消标签出错');
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

Wechat.prototype.getIdListTags = function(openid) { // 获取用户身上的标签列表
    const that = this;
    const form = {
        openid,
    };
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
        .then((data) => {
            const url = `${api.tags.getidlist}access_token=${data.access_token}`;
            request({ method: 'POST', url, body:form, json: true }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body) {
                        resolve(body); 
                    } else {
                        throw new Error('获取用户身上的标签列表出错');
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