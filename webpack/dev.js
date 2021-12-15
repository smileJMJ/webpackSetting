const { merge } = require('webpack-merge');
const common = require('./common');
const path = require('path');
const mode = 'development';

module.exports = merge(common(mode), {
    mode: mode,
    devServer: {
        static: path.join(__dirname, '../dist'),
        hot: true,
        //liveReload: true,
        port: 7777
    },
    devtool: 'inline-source-map',
});