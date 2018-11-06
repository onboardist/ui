const path = require('path')

module.exports = (options, ctx) => {
  const distAssetsPath = path.resolve(ctx.sourceDir, '../dist')

  return {
      // For development
      enhanceDevServer (app) {
        const mount = require('koa-mount')
        const serveStatic = require('koa-static')
        app.use(mount(path.join(ctx.base, 'dist'), serveStatic(distAssetsPath)))
      },

      // // For production
      // async generated () {
      //   const { fs } = require('@vuepress/shared-utils')
      //   await fs.copy(imagesAssetsPath, path.resolve(ctx.outDir, 'images'))
      // }
  }
}