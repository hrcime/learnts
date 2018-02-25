import * as request from 'request';
import * as cheerio from 'cheerio';

class Fshare {
    private _request;
    private _cheerio;
    private _config = {
        "username" : "",
        "password" : "",
        "loginPath": "https://www.fshare.vn/site/login",
        "homePath": "https://www.fshare.vn/",
        "downloadPath": "https://www.fshare.vn/download/get",
        "filePath": "https://www.fshare.vn/file/"
    };

    constructor(request, cheerio) {
        this._request = request;
        this._cheerio = cheerio;
        let account = require('../config.json').account;
        this._config.username = account.username;
        this._config.password = account.password;
        let j = this._request.jar();
        this._request = this._request.defaults({jar: j, followAllRedirects: true});
    }

    async get(id: string, password: string = '') {
        let csrf: any = '';
        let html: any = await this.getHtml(this._config.loginPath);
        if (html.statusCode == 200) {
            // DO LOGIN
            csrf = await this.getCsrf(html.body);
            await this.postLogin(csrf);
        }

        //GET PAGE DOWNLOAD FILE
        html = await this.getHtml(this._config.filePath + id);

        //GET CSRF
        csrf = await this.getCsrf(html.body);

        return await this.getLinkDownload(csrf, id);
    }

    getHtml(url: string = '') {
        return new Promise((resolve, reject) => {
            this._request.get(url, {timeout: 5000}, (err, resp, body) => {
                if (err && err.code === 'ETIMEDOUT') {
                    reject(err);
                } else {
                    resolve(resp);
                }
            })
        });
    }

    getCsrf(body: string = '') {
        return new Promise(resolve => {
            let $ = this._cheerio.load(body);
            let csrf = $('input[name="_csrf-app"]').val();
            resolve(csrf.toString());
        });
    }

    postLogin(csrf: string = '') {
        return new Promise((resolve, reject) => {
            let form = {
                "_csrf-app": csrf,
                "LoginForm[email]": this._config.username,
                "LoginForm[password]": this._config.password,
                "LoginForm[rememberMe]": 1
            };

            let test = this._request.post(this._config.loginPath, {form: form}, (err, resp, body) => {
                if (resp.request.req.path != '/file/manager') {
                    reject();
                } else {
                    resolve();
                }
            });
        })
    }

    getLinkDownload(csrf: string = '', id: string) {
        return new Promise((resolve, reject) => {
            let form = {
                "_csrf-app": csrf,
                "withFcode5": 0,
                "linkcode": id,
                "fcode5": "",
            };

            this._request.post(this._config.downloadPath, {form: form}, (err, resp, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                } catch (er) {
                    resolve({error: true, msg: "LINK DIED", code: 204});
                    return;
                }

                if (data.wait_time == undefined) {
                    resolve({error: true, msg: "CAN'T GET", code: 500});
                } else {
                    data.code = 200;
                    resolve(data);
                }
            });
        })
    }
}

export default new Fshare(request, cheerio);