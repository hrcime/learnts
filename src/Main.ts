import * as http from 'http';
import * as url from 'url';
import Fshare from './libs/Fshare';

class Main {
    constructor(port: number) {
        http.createServer(this.requestHandler).listen(port, () => {
            console.log(`Server is running on port : ${port}`);
        });
    }

    async requestHandler(req, res) {
        let q = url.parse(req.url, true);
        let params = q.query;

        if (q.pathname != '/api/fshare' || !params.id) {
            res.write(JSON.stringify({'error': true, 'msg': 'API NOT FOUND', 'code': 404}));
            res.end();
            return;
        }

        let result: any = await Fshare.get(<string>params.id);

        if (!!params.format && params.format == 'json') {
            res.write(JSON.stringify(result));
        } else {
            res.write((!!result.url) ? result.url : result.msg);
        }

        res.end();
    }
}

new Main(3000);
