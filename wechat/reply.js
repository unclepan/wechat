'use strict'

const tpl = require('./tpl');

module.exports = (message) => {
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
                case '1':
                    reply = tpl.message.text(message, "第一");
                    break;
                case '2':
                    reply = tpl.message.text(message, "第二");
                    break;
                case '3':
                    reply = tpl.message.text(message, "第三");
                    break;
                case '4':
                    reply = tpl.message.text(message, "第四");
                    break;
                case '5':
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
            }
            return reply;
    }
}