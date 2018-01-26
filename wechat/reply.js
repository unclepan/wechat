'use strict'

const tpl = require('./tpl');
const path = require('path');
const config = require('../config');
const Wechat = require('./wechat');
const wechatApi = new Wechat(config.wechat);

module.exports = async (message) => {
    switch(message.MsgType){
        case 'event':
            switch(message.Event){
                case 'subscribe':
                    if (message.EventKey) {
                        console.log(`扫二维码进来${message.EventKey}${message.Ticket}`);
                    }
                    return tpl.message.text(message, 'Hi! 你订阅了一个公众号');
                    break;
                case 'unsubscribe':
                    console.log('取消关注');
                    return '';
                    break;
                case 'LOCATION':
                    return tpl.message.text(message, `您上报的位置是:纬度${message.Latitude}经度${message.Longitude}精度${message.Precision}`);
                    break;
                case 'CLICK':
                    return tpl.message.text(message, `您点击了菜单${message.EventKey}`);
                    break;
                case 'SCAN':
                    return tpl.message.text(message, `关注后扫二维码${message.EventKey}${message.Ticket}`);
                    break;
                case 'VIEW':
                    return tpl.message.text(message, `您点击了菜单中的链接${message.EventKey}`);
                    break;
                default:
                    console.log('其他事件');
            }
        break;
        case 'text':
            const content = message.Content;
            let reply = tpl.message.text(message, `你说的${content}太复杂了`);
            switch(content){
                case '文本':
                    reply = tpl.message.text(message, '我是文本消息');
                    break;
                case '音乐':
                    await wechatApi.uploadtTemporaryMaterial('thumb', path.join(__dirname, '../static/images/thumb.jpg'))
                    .then((data) => {
                        reply = tpl.message.music(message, {
                            title: '音乐标题',
                            description: '音乐描述',
                            musicUrl: 'http://www.w3school.com.cn/i/song.mp3',
                            hqMusicUrl: 'http://www.w3school.com.cn/i/song.mp3',
                            mediaId: data.thumb_media_id,
                        });
                    });
                    break;
                case '语音':
                    await wechatApi.uploadtTemporaryMaterial('voice', path.join(__dirname, '../static/voices/song.mp3'))
                    .then((data) => {
                        reply = tpl.message.voice(message, {
                            title: '语音标题',
                            description: '语音描述',
                            mediaId: data.media_id,
                        });
                    });
                    break;
                case '视频':
                    await wechatApi.uploadtTemporaryMaterial('video', path.join(__dirname, '../static/videos/movie.mp4'))
                    .then((data) => {
                        reply = tpl.message.video(message, {
                            title: '视频标题',
                            description: '我是视频描述',
                            mediaId: data.media_id,
                        });
                    });
                    break;
                case '图片':
                    await wechatApi.uploadtTemporaryMaterial('image', path.join(__dirname, '../static/images/1.jpg'))
                    .then((data) => {
                        reply = tpl.message.image(message, {
                            mediaId: data.media_id,
                        });
                    });
                    break;
                case '图文':
                    reply = tpl.message.news(message, [
                        {
                            title: '来自36KR',
                            description: '36KR',
                            picUrl: 'https://pic.36krcnd.com/201801/25062342/eujty4fho2c3evz2!heading',
                            url: 'http://36kr.com/',
                        },
                        {
                            title: '来自GITHUB',
                            description: 'GITHUB',
                            picUrl: 'https://pic.36krcnd.com/201801/25062446/608xi3hm23ma81jv!heading',
                            url: 'https://github.com/',
                        }
                    ]);
                    break;
                case '永久图片':
                    await wechatApi.uploadtPermanentMaterial('image', path.join(__dirname, '../static/images/2.jpg'))
                    .then((data) => {
                        console.log(data, 12345);
                        reply = tpl.message.image(message, {
                            mediaId: data.media_id,
                        });
                    });
                    break; 
                case '永久视频':
                    const description = JSON.stringify({
                        title: '上传永久视频文件的标题',
                        introduction: '上传永久视频文件的描述',
                    });
                    await wechatApi.uploadtPermanentMaterial('video', path.join(__dirname, '../static/videos/movie.mp4'), {description})
                    .then((data) => {
                        console.log(data);
                        reply = tpl.message.video(message, {
                            title: '视频标题',
                            description: '我是视频描述',
                            mediaId: data.media_id,
                        });
                    });
                    break; 
                default:
                    console.log('其他回复');
            }
            return reply;
    }
}