const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (mode) => {
    const isDevMode = mode !== 'production';

    return {
        entry: {
            'js/polyfill': '@babel/polyfill',
            'css/style': './src/css/style.scss', // style.js도 생김
            'js/main': './src/js/main.js',
            'js/index': './src/js/index.ts'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, '../src/js'),
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.ts(x?)$/,
                    include: path.resolve(__dirname, '../src/js'),
                    exclude: /node_modules/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.(s[ac]ss)$/,
                    use: [ // 아래의 로더부터 변환함. 위의 로더가 제일 마지막에 실행
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(ico|png|jpe?g|gif|svg)$/,
                    type: 'asset/resource', // file-loader
                    generator: {
                        filename: 'img/[name][ext]'
                    }
                },
                {
                    test: /\.(woff|woff2|ttf|eot)$/,
                    type: 'asset/resource', // file-loader
                    generator: {
                        filename: 'css/font/[name][ext]'
                    }
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: `css/${isDevMode ? '[name].css' : '[name].[hash].css'}`
            })
        ],
        resolve: {
            modules: ['node_modules'],
            extensions: ['.js', '.ts', '.tsx', '.css', '.scss']
        },
        optimization: {
            minimize: isDevMode ? false : true
        }
    }
};