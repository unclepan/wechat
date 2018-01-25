'use strict'

const util = require('./util');

exports.message = {
    text (msg, content) {
        return util.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'text',
                Content: content,
            }
        })
    },
    image (msg, content) {
        return util.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'image',
                Image: {
                    MediaId: content.mediaId,
                },
            }
        })
    },
    voice (msg, content) {
        return util.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'voice',
                Voice: {
                    MediaId: content.mediaId,
                },
            }
        })
    },
    video (msg, content) {
        return util.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'video',
                Video: {
                    MediaId: content.mediaId,
                    Title: content.title,
                    Description: content.description,
                },
            }
        })
    },
    music (msg, content) {
        return util.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'music',
                Music: {
                    Title: content.title,
                    Description: content.description,
                    MusicUrl: content.musicUrl,
                    HQMusicUrl: content.hqMusicUrl,
                    ThumbMediaId: content.mediaId,
                },
            }
        })
    },
    news (msg, content) {
        const items = content.map((item) => {
            return ({
                Title: item.title,
                Description: item.description,
                PicUrl: item.picUrl,
                Url: item.url,
            })
        });
        return util.jsonToXml({
            xml: {
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: 'news',
                ArticleCount: content.length,
                Articles: {
                    item: items,
                } 
            }
        })
    }
}