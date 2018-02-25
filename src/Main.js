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
const http = require("http");
const url = require("url");
const Fshare_1 = require("./libs/Fshare");
class Main {
    constructor(port) {
        http.createServer(this.requestHandler).listen(port, () => {
            console.log(`Server is running on port : ${port}`);
        });
    }
    requestHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let q = url.parse(req.url, true);
            let params = q.query;
            if (q.pathname != '/api/fshare' || !params.id) {
                res.write(JSON.stringify({ 'error': true, 'msg': 'API NOT FOUND', 'code': 404 }));
                res.end();
                return;
            }
            let result = yield Fshare_1.default.get(params.id);
            if (!!params.format && params.format == 'json') {
                res.write(JSON.stringify(result));
            }
            else {
                res.write((!!result.url) ? result.url : result.msg);
            }
            res.end();
        });
    }
}
new Main(3000);
//# sourceMappingURL=Main.js.map