const { merge } = require('webpack-merge');
const common = require('./common');
const path = require('path');
const mode = 'production';

module.exports = merge(common(mode), {
    mode: mode,
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, '../dist'),
        clean: true // dist 폴더 지워줌
    },
    devtool: 'source-map'
});