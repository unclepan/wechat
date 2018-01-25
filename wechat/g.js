'use strict'

const sha1 = require('sha1');
const getRawBody = require('raw-body');
const Wechat = require('./wechat');
const util = require('./util');
const reply = require('./reply');

module.exports = function(opts) {
    const wechat = new Wechat(opts);
    return async (ctx, next) =>  {
        const token = opts.token;
        const signature = ctx.query.signature;
        const nonce = ctx.query.nonce;
        const timestamp = ctx.query.timestamp;
        const echostr = ctx.query.echostr;
        const str = [token, timestamp, nonce].sort().join('');
        const sha = sha1(str);
        if(ctx.method === 'GET') {
            if(sha === signature) {
                ctx.body = echostr  + '';
            } else {
                ctx.body = 'wrog';
            }
        } else if(ctx.method === 'POST') {
            if(sha !== signature) {
                ctx.body = 'wrog';
                return false;
            }
            try {
                const data = await getRawBody(ctx.req,{//通过await拿到POST过来异步请求的原始XML数据
                    length: ctx.request.length,
                    limit: "1mb",
                    encoding: ctx.request.charset
                });
                const content = await util.xmlToJson(data);
                const xml = await reply(content.xml);
                ctx.status = 200;
                ctx.type = 'application/xml';
                ctx.body = xml;
            } catch (error) {
                console.log(error);
            }
        }
    };
    
}