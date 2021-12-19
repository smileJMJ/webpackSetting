const { merge } = require('webpack-merge');
const common = require('./common');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const mode = 'production';

module.exports = merge(common(mode), {
    mode: mode,
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, '../dist'),
        clean: true // dist 폴더 지워줌
    },
    devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true // 콘솔 로그 제거
                    }
                },
                extractComments: true // 코멘트 모아서 파일명.LICENSE.txt 생성
            })
        ]
    }
});