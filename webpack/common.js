const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScripts = require('webpack-remove-empty-scripts');

module.exports = (mode) => {
    const isDevMode = mode !== 'production';

    return {
        entry: {
            'css/style': './src/css/style.scss', 
            'js/main': './src/js/main.js',
            'js/index': './src/js/index.ts'
        },
        target: ['web', 'es5'], // babel에서 es6+을 transcompile 해주어도 webpack에서 es6+ 사용하도록 설정되어 있어 es5 target 추가
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, '../src/js'),
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    "useBuiltIns": "usage",
                                    "corejs": "3"
                                },
                                '@babel/preset-typescript',
                            ]
                        ]
                    }

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
            new RemoveEmptyScripts(),
            new HtmlWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: `${isDevMode ? '[name].css' : '[name].[hash].css'}`
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