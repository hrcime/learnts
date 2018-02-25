"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const cheerio = require("cheerio");
class Fshare {
    constructor(request, cheerio) {
        this._config = {
            "username": "",
            "password": "",
            "loginPath": "https://www.fshare.vn/site/login",
            "homePath": "https://www.fshare.vn/",
            "downloadPath": "https://www.fshare.vn/download/get",
            "filePath": "https://www.fshare.vn/file/"
        };
        this._request = request;
        this._cheerio = cheerio;
        let account = require('../config.json').account;
        this._config.username = account.username;
        this._config.password = account.password;
        let j = this._request.jar();
        this._request = this._request.defaults({ jar: j, followAllRedirects: true });
    }
    get(id, password = '') {
        return __awaiter(this, void 0, void 0, function* () {
            let csrf = '';
            let html = yield this.getHtml(this._config.loginPath);
            if (html.statusCode == 200) {
                // DO LOGIN
                csrf = yield this.getCsrf(html.body);
                yield this.postLogin(csrf);
            }
            //GET PAGE DOWNLOAD FILE
            html = yield this.getHtml(this._config.filePath + id);
            //GET CSRF
            csrf = yield this.getCsrf(html.body);
            return yield this.getLinkDownload(csrf, id);
        });
    }
    getHtml(url = '') {
        return new Promise((resolve, reject) => {
            this._request.get(url, { timeout: 5000 }, (err, resp, body) => {
                if (err && err.code === 'ETIMEDOUT') {
                    reject(err);
                }
                else {
                    resolve(resp);
                }
            });
        });
    }
    getCsrf(body = '') {
        return new Promise(resolve => {
            let $ = this._cheerio.load(body);
            let csrf = $('input[name="_csrf-app"]').val();
            resolve(csrf.toString());
        });
    }
    postLogin(csrf = '') {
        return new Promise((resolve, reject) => {
            let form = {
                "_csrf-app": csrf,
                "LoginForm[email]": this._config.username,
                "LoginForm[password]": this._config.password,
                "LoginForm[rememberMe]": 1
            };
            let test = this._request.post(this._config.loginPath, { form: form }, (err, resp, body) => {
                if (resp.request.req.path != '/file/manager') {
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    }
    getLinkDownload(csrf = '', id) {
        return new Promise((resolve, reject) => {
            let form = {
                "_csrf-app": csrf,
                "withFcode5": 0,
                "linkcode": id,
                "fcode5": "",
            };
            this._request.post(this._config.downloadPath, { form: form }, (err, resp, body) => {
                let data;
                try {
                    data = JSON.parse(body);
                }
                catch (er) {
                    resolve({ error: true, msg: "LINK DIED", code: 204 });
                    return;
                }
                if (data.wait_time == undefined) {
                    resolve({ error: true, msg: "CAN'T GET", code: 500 });
                }
                else {
                    data.code = 200;
                    resolve(data);
                }
            });
        });
    }
}
exports.default = new Fshare(request, cheerio);
//# sourceMappingURL=Fshare.js.map