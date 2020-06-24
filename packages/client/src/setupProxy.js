const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/figma',
    createProxyMiddleware({
      target: 'https://api.figma.com/v1',
      changeOrigin: true,
      headers: { 'X-FIGMA-TOKEN': process.env.REACT_APP_X_FIGMA_TOKEN },
      pathRewrite: {
        '/figma': '',
      },
    })
  )
}
