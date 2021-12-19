# webpackSetting
webpack5 setting  

<br/><br/>

## webpack 설치
```
npm install --save-dev webpack webpack-cli webpack-merge
```

<br/><br/>

## webpack 설정 파일 분리
(why?) webpack 설정 분리 이유: development와 production 빌드 목표는 다르므로   
-> webpack-merge 유틸리티 사용하여 공통 설정은 같이, 그 외의 설정은 환경별로 설정하도록 함   
https://webpack.kr/guides/production/#setup

<br/><br/>

## 공통 설정 (common.js)
<br/>

### (1) Entry 설정
https://webpack.kr/configuration/entry-context/#entry

* 하나의 entry 명으로 js, css 각각 별도의 번들을 얻기 위해서 배열을 사용할 수 있음

```
entry: {
        index: ['./src/index.js', './src/style.css'],  // index.js, index.css 로 각각 다른 타입의 번들파일 생성됨
        print: './src/print.js'
    },

// css의 경우 MiniCssExtractPlugin 사용 시, filename: 'css/[name].css'처럼 경로도 함께 넣어주면 css폴더안에 파일 생성됨 
```
* webpack은 기본적으로 번들 후 js 파일을 생성하여, css를 entry에 단독 추가 시에 css, js 파일 둘다 생성되는 이슈 발생   
-> webpack-fix-style-only-entries 또는 webpack-remove-empty-scripts 플러그인 사용하여 js 제거
```
npm install --save-dev webpack-fix-style-only-entries

// webpack.config.js
const FixStyleOnlyEntries = require('webpack-fix-style-only-entries');

modules.exports = {
    plugins: [
        new FixStyleOnlyEntries()
    ]
}

```
※ 단, FixStyleOnlyEntries 플러그인은 webpack-dev-server 실행 시   
"Module.entryModule: Multiple entry modules are not supported by the deprecated API (Use the new ChunkGroup API)"
에러 발생.   
-> Webpack5로 버전업되면서 해당 플러그인이 불안정하다는 글 확인.   
webpack-remove-empty-scripts 플러그인 추천해줌   

```
npm install --save-dev webpack-remove-empty-scripts

// webpack.config.js
const RemoveEmptyScripts = require('webpack-remove-empty-scripts');

modules.exports = {
    plugins: [
        new RemoveEmptyScripts()
    ]
}

```
* css entry는 webpack-dev-server의 HMR 정상동작하지 않음.   
-> optionmization.runtimeChunk: 'single' 로 해결 가능   
https://github.com/webpack/webpack-dev-server/issues/2792

```
// dev.js

{
    optimization: {
        runtimeChunk: 'single'
    }
}
```

<br/>

### (2) Output 설정
https://webpack.kr/configuration/output/

* webpack-dev-server 사용 시에는 ouput은 production mode에서만 설정
* dist 폴더 초기화  `clean: true`
* (선택사항) 파일명에 hash 사용 가능
```
output: { 
    filename: '[name].[contenthash].js', 
    path: path.resolve(__dirname, 'dist'), 
    clean: true, 
},
```
* (선택사항) 라이브러리 작성 시 output.library 옵션 설정 가능   
https://webpack.kr/guides/author-libraries/
```
module.exports = {
    output: {
        library: {
            name: 'libraryName', // 라이브러리 이름. window.libaryName 등으로 호출 가능
            type: 'umd' // umd 추가해줘야 CommonJS, AMD, script 태그에서 사용 가능
        }
    }
}
```

<br/>

### (3) Loader 설정
https://webpack.kr/concepts/loaders/

```
npm install --save-dev babel-loader @babel/core @babel/preset-env sass-loader css-loader
npm install --save @babel/polyfill // polyfill은 런타임때 다른 js보다 먼저 실행되어야 함
```
* babel-loader, sass-loader, css-loader 등
* webpack에서 babel 셋팅 시 babel-loader의 간단한 설정으로 사용할 수 있으나, 커스터마이징 하려면 babel.config.js 생성하여 작업 가능   
https://webpack.js.org/loaders/babel-loader/#customize-config-based-on-webpack-target
* [babel] es6+ -> es5 transcompile 방법   
(1) core-js (현재)
core-js 설치 및 webpack.config.js의 babel-loader 설정 시 options 추가해주기
https://webpack.js.org/loaders/babel-loader/#options   
https://webpack.js.org/loaders/babel-loader/#customize-config-based-on-webpack-target
```
npm install --save core-js

// webpack.config.js
{
    {
        test: /\.js$/,
        include: path.resolve(__dirname, '../src/js'),
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
            presets: [
                [
                    '@babel/preset-env',
                    '@babel/preset-typescript',
                    {
                        'useBuiltIns': 'usage',
                        'corejs': '3'
                    }
                ]
            ]
        }

    },
}
```
(2) @babel/polyfill (구버전)
```
npm install --save @babel/polyfill
npm install --save-dev @babel/plugin-transform-arrow-functions
```

※ babel-loader로 es5 transcompile 되었으나 번들파일에서 화살표 함수 등이 남아있어 ie11에서 실행할 수 없을 때   
-> webpack의 `target: ['web', 'es5']`로 설정   
```
target: ['web', 'es5'], // babel에서 es6+을 transcompile 해주어도 webpack에서 es6+ 사용하도록 설정되어 있어 es5 target 추가
```

<br/>

* MiniCssExtractPlugin 인스턴스.loader 사용
* image/font 등 기존에 url-loader, file-loader로 처리하던 리소스들을 webpack5부턴 애셋 모듈을 이용해 처리할 수 있음
  https://webpack.kr/guides/asset-modules/ 

```
module.exports = {
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/i,
                type: 'asset/resource' // file-loader 처리 방식
            }
        ]
    }
}
```
※ 단, 'asset/resource' 모듈은 파일명을 변환하는데, 
* 하나의 폴더에 저장할 때: `output.assetModuleFilename` 을 변경 
```
output: {
    // img 폴더에 파일명.확장자 로 생성되도록. 단, asset Module을 로더로 사용한 파일을 전부 해당 경로에 생성됨
    assetModuleFilename: 'img/[name][ext]' 
}
```
* asset 별로 각각 다른 폴더에 저장하고 싶을 때: `module.rules.generator` 사용
```
module: {
    rules: [
        {
            test: /\.(png|svg|jpg|gif)$/i,
            type: 'asset/resource',
            generator: {
                filename: 'img/[name][ext]'
            }
        },
        {
            test: /\.woff$/i,
            type: 'asset/resource',
            generator: {
                filename: 'css/font/[name][ext]'
            }
        }    
    ]
}
```
* (선택사항) 로더 설정 시 include 필드 사용해서 실제 변환해야하는 모듈에만 적용하기 (빌드성능개선)   
https://webpack.kr/guides/build-performance/#loaders

```
module: { 
    rules: [ 
        { 
            test: /\.js$/, 
            include: path.resolve(__dirname, 'src'), 
            loader: 'babel-loader', 
        }, 
    ], 
},
```

* (선택사항) ts-loader 빌드 성능 개선을 위해 transpileOnly 로더 옵션을 사용하기
타입 검사를 다시 받으려면 ForkTsCheckerWebpackPlugin을 사용
https://webpack.kr/guides/build-performance/#typescript-loader

<br/>

### (4) Plugin 설정
https://webpack.kr/plugins/ 

```
npm install --save-dev html-webpack-plugin mini-css-extract-plugin
```
* MiniCssExtractPlugin 인스턴스 생성 및 옵션 설정
* HtmlWebpackPlugin
* (선택사항) BannerPlugin

<br/>

### (5. 선택사항) optimization.splitChunk plugin 설정
* SplitChunksPlugin 플러그인 사용, 설치 없이 즉시 사용 가능
* 공통 의존성 추출하여 별도 파일로 생성
https://webpack.kr/configuration/optimization/#optimizationsplitchunks

```
module.exports = {
    optimization: { 
        splitChunks: { 
        chunks: 'all', 
        }, 
    },
}
```

<br/>

### (6. 선택사항) runtime시 실행할 코드만 별도의 청크로 분리 가능
https://webpack.kr/configuration/optimization/#optimizationruntimechunk

```
module.exports = {
    optimization: { 
        runtimeChunk: 'single',  // 단일 런타임 번들로 생성하겠다는 의미
    },
}
```
<br/>

### (7. 선택사항) 변경될 가능성이 적은 코드는 별도의 vendor 청크로 추출해서 사용
* lodash, react 등 타사 라이브러리는 로컬 소스보다 변경될 가능성이 적기 때문에 vendor 청크로 추출해서 사용 가능함
https://webpack.kr/plugins/split-chunks-plugin/#splitchunkscachegroups

```
modules.exports = {
    optimizations: {
        splitChunks: { 
           cacheGroups: { 
             vendor: { 
               test: /[\\/]node_modules[\\/]/, 
               name: 'vendors', 
               chunks: 'all', 
             }, 
           }, 
         },
    }
}
```
<br/>

### (8. 선택사항) externals - import 된 패키지의 번들링 방지하고 런타임에 외부종속성 검색함
https://webpack.kr/configuration/externals/

(ex) `<script>`태그로 jquery같은 외부 라이브러리 로드 시 번들링 방지 및 런타임에 jquery 검색함

```
// index.html
<script 
  src="https://code.jquery.com/jquery-3.1.0.js" 
  integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk=" 
  crossorigin="anonymous" 
></script>

// webpack.config.js
module.exports = { 
  //... 
  externals: { 
    jquery: 'jQuery', 
  }, 
};

// index.js
import $ from 'jquery'; 
$('.my-element').animate(/* ... */);
```

<br/><br/>

## development mode (dev.js)

https://webpack.kr/guides/development/
<br/>

### (1) sourcemap 사용
<br/>

### (2) webpack watch또는 webpack-dev-server  사용
https://webpack.kr/guides/build-performance/#incremental-builds 
https://webpack.kr/guides/build-performance/#compile-in-memory

```
npm install --save-dev webpack-dev-server
```
<br/>

### (3) HMR(Hot Module Replacement) / LiveReload 설정
https://webpack.kr/guides/hot-module-replacement/

* 모든 모듈을 새로고침 필요없이 런타임에 업데이트 할 수 있음
* webpack-dev-server v4 부터 HMR 기본적으로 활성화되어 있음
* webpack-dev-server에도 live reload 속성 있음
* webpack watch 사용 시에는 vscode Live Server Extension 사용하여 로컬 서버 띄우면 Live Reloading 처럼 사용 가능   
(dist폴더의 index.html을 Live Server로 띄움 ->  코드 수정 -> webpack watch로 변화 감지 및 재빌드 -> index.html 리로드)   
* Entry에 css 설정 시, 'webpack-remove-empty-scripts' 플러그인을 사용하여 css 번들 시 생성되는 js를 제거하는데 이 때 HMR이 정상 동작하지 않음.   
-> development일 때만 `optimization.runtimeChunk: 'single'` 설정함
```
optimization: {
    runtimeChunk: 'single' // css entry는 webpack-dev-server HMR 동작하지 않는데, 해당 속성 설정 시 HMR 사용 가능
}
```

※ TerserPlugin 등 플러그인 사용 및 output hash 관련은 Production 모드에서 사용하기   
https://webpack.kr/guides/build-performance/#avoid-production-specific-tooling

<br/><br/>

## production mode (prod.js)
https://webpack.kr/guides/production/
<br/>

### (1) webpack-dev-server 사용 시 ouput 설정
<br/>

### (2) TerserPlugin 
* minimize, uglify, 콘솔로그 제거 등
* webpack5 이상부터 내재되어 있지만, 옵션 등 커스텀하게 쓰려면 설치 필요!
```
npm install --save-dev terser-webpack-plugin

// prod.js
const TerserPlugin = require('terser-webpack-plugin');

{
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
}
```
<br/>

### (3) CSS minimize - CssMinimizerPlugin 사용 
https://webpack.kr/plugins/mini-css-extract-plugin/#minimizing-for-production
<br/>

### (4) sourcemap 사용 지양 (빌드성능개선)
https://webpack.kr/guides/build-performance/#source-maps
<br/>

### (5) (선택사항) output.pathInfo 끄기 
- webpack은 출력 번들에 경로 정보를 생성하는 기능이 있지만, 많은 모듈을 번들로 묶을 경우엔 가비지 컬렉션에 영향을 주어 해당 기능 끄는게 빌드성능에 좋음  
https://webpack.kr/guides/build-performance/#avoid-production-specific-tooling

※ tree shaking   
https://webpack.kr/guides/tree-shaking/

<br/><br/>

## package.json 설정
<br/>

### (1) 환경옵션 --env 로 development, production 빌드 실행
https://webpack.kr/guides/environment-variables/
```
npx webpack --env goal=local --env production --progress 
```

<br/><br/>

## Typescript
https://webpack.kr/guides/typescript/
<br/>

### (1) typescript 및 ts-loader 설치
```
npm install --save-dev typescript ts-loader
```
<br/>

### (2) tsconfig.json 추가
```
{
    "compilerOptions": {
        "outDir": "./dist/js/",
        "noImplicitAny": true,
        "module": "es6",
        "target": "es5",
        "allowJs": true,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"] 
}
```
<br/>

### (3) webpack loader에 ts-loader 추가
<br/>

### (4) image 등 assets 타입 정의 필요 
* typing.d.ts 생성
```
declare module '*.css';
declare module '*.scss';
declare module '*.jpg';
declare module '*.png';
declare module '*.gif';
declare module '*.svg';
```
* tsconfig.json 에 연결
```
// 방법1
{
    "include": ["src/types/typings.d.ts"]
}

// 방법2
{
    "compilerOptions": {
        "typeRoots": ["src/types"]
    }
}
```


