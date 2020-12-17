
/**
 * @fileoverview Template to compose HTTP reqeuest.
 * 
 */

const url = `http://extshort.weixin.qq.com/mmtls/1e2d77b0`;
const method = `POST`;
const headers = {
'Accept' : `*/*`,
'Accept-Encoding' : `gzip, deflate`,
'Cache-Control' : `no-cache`,
'Content-Type' : `application/octet-stream`,
'Connection' : `Keep-Alive`,
'Host' : `extshort.weixin.qq.com`,
'User-Agent' : `MicroMessenger Client`,
'Accept-Language' : `zh-cn`,
'Upgrade' : `mmtls`
};
const body = ``;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {
    $done()
}, reason => {
    $done()
});
