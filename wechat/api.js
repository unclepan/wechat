const prefix = 'https://api.weixin.qq.com/cgi-bin/';

const api = {
    accessToken: `${prefix}token?grant_type=client_credential`,
    temporary: {
        upload: `${prefix}media/upload?`,
        fetch: `${prefix}media/get?`,
    },
    permanent: {
        upload: `${prefix}material/add_material?`,
        uploadNews: `${prefix}material/add_news?`,
        uploadNewsPic: `${prefix}media/uploadimg?`,
        fetch: `${prefix}material/get_material?`,
        del: `${prefix}material/del_material?`,
        update: `${prefix}material/update_news?`,
        count: `${prefix}material/get_materialcount?`,
        batch: `${prefix}material/batchget_material?`,
    },
    tags: {
        create: `${prefix}tags/create?`,
        get: `${prefix}tags/get?`,
        update: `${prefix}tags/update?`,
        delete: `${prefix}tags/delete?`,
        getUsers: `${prefix}user/tag/get?`,
        batchtagging: `${prefix}tags/members/batchtagging?`,
        batchuntagging: `${prefix}tags/members/batchuntagging?`,
        getidlist: `${prefix}tags/getidlist?`,
    },
};
module.exports = api;