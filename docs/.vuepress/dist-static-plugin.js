const { fs, path } = require('@vuepress/shared-utils')
const express = require('express')

module.exports = (options, context) => {
  const distAssetsPath = path.resolve(context.sourceDir, '../dist')

  return {
    // For development
    beforeDevServer (app) {
      app.use('/dist', express.static(distAssetsPath))
    },

    // For production
    async generated () {
      await fs.copy(distAssetsPath, path.resolve(context.outDir, 'dist'))
    }
  }
};
