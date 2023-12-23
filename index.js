const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const { default: fetch } = import('node-fetch'); // 変更点

const server = http.createServer((req, res) => {
  // URLのクエリから目的のURLを抽出
  const queryData = url.parse(req.url, true).query;
  const targetUrl = queryData.url;

  // URLが指定されていない場合はエラーを返す
  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('URL parameter is missing');
    return;
  }

  // プロキシ先のURLにリクエストを転送
  console.log("target = " + targetUrl);

  // ここにターゲット先でのfetch処理をフックするコードを追加
  fetch(targetUrl)
    .then(fetchRes => {
      // プロキシ先からのレスポンスを元のレスポンスにパイプ
      res.writeHead(fetchRes.status, fetchRes.headers);
      fetchRes.body.pipe(res, { end: true });

      // ターゲット先でのfetch処理の結果をログに出力
      return fetchRes.text();
    })
    .then(result => {
      console.log('Target Fetch Result:', result);
    })
    .catch(err => {
      console.error('Fetch Error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Fetch Error');
    });

  // プロキシ先のリクエストに対してのフック
  proxy.on('proxyReq', (proxyReq, req, res) => {
    // ここにターゲット先でのfetch処理をフックするコードを追加
	// fuck
    console.log('Hooking into proxyReq:', req.method, req.url);

    // 例: カスタムヘッダーを追加する場合
    // proxyReq.setHeader('X-Custom-Header', 'my-custom-header-value');
  });
});

server.listen(3000, () => {
  console.log('Proxy server listening on port 3000');
});
