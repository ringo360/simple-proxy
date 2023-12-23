const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

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
  const proxyRequest = proxy.web(req, res, { target: targetUrl });

  // プロキシ先からのレスポンスを元のレスポンスにパイプ
  proxyRequest.on('proxyRes', (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  // プロキシ先からのエラーを処理
  proxyRequest.on('error', (err) => {
    console.error('Proxy Error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error');
  });

  // プロキシ先のリクエストに対してのフック
  proxyRequest.on('proxyReq', (proxyReq, req, res) => {
    // ここにターゲット先でのfetch処理をフックするコードを追加
    console.log('Hooking into proxyReq:', req.method, req.url);

    // 例: カスタムヘッダーを追加する場合
    // proxyReq.setHeader('X-Custom-Header', 'my-custom-header-value');
  });
});

server.listen(3000, () => {
  console.log('Proxy server listening on port 3000');
});
