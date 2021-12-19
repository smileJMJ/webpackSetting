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
    optimization: {
        runtimeChunk: 'single' // css entry는 webpack-dev-server HMR 동작하지 않는데, 해당 속성 설정 시 HMR 사용 가능
    }
});