# webpackSetting
webpack5 setting  


## webpack 설치
```
npm install --save-dev webpack webpack-cli webpack-merge
```


## webpack 설정 파일 분리
(why?) webpack 설정 분리 이유: development와 production 빌드 목표는 다르므로   
-> webpack-merge 유틸리티 사용하여 공통 설정은 같이, 그 외의 설정은 환경별로 설정하도록 함   
https://webpack.kr/guides/production/#setup



## 공통 설정 (common.js)
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


### (2) output
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



### (3) Loader 설정
https://webpack.kr/concepts/loaders/

```
npm install --save-dev babel-loader @babel/core @babel/preset-env sass-loader css-loader
npm install --save @babel/polyfill // polyfill은 런타임때 다른 js보다 먼저 실행되어야 함
```
* babel-loader, sass-loader, css-loader 등
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



### (4) Plugin 설정
https://webpack.kr/plugins/ 

```
npm install --save-dev html-webpack-plugin mini-css-extract-plugin
```
* MiniCssExtractPlugin 인스턴스 생성 및 옵션 설정
* HtmlWebpackPlugin
* (선택사항) BannerPlugin



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



### (6. 선택사항) runtime시 실행할 코드만 별도의 청크로 분리 가능
https://webpack.kr/configuration/optimization/#optimizationruntimechunk

```
module.exports = {
    optimization: { 
        runtimeChunk: 'single',  // 단일 런타임 번들로 생성하겠다는 의미
    },
}
```


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


## development mode (dev.js)
### (1) sourcemap 사용
### (2) webpack watch또는 webpack-dev-server  사용
https://webpack.kr/guides/build-performance/#incremental-builds 
https://webpack.kr/guides/build-performance/#compile-in-memory

```
npm install --save-dev webpack-dev-server
```

### (3) HMR(Hot Module Replacement) / LiveReload 설정
https://webpack.kr/guides/hot-module-replacement/

* 모든 모듈을 새로고침 필요없이 런타임에 업데이트 할 수 있음
* webpack-dev-server v4 부터 HMR 기본적으로 활성화되어 있음
* webpack-dev-server에도 live reload 속성 있음
* webpack watch 사용 시에는 vscode Live Server Extension 사용하여 로컬 서버 띄우면 Live Reloading 처럼 사용 가능   
(dist폴더의 index.html을 Live Server로 띄움 ->  코드 수정 -> webpack watch로 변화 감지 및 재빌드 -> index.html 리로드)

※ TerserPlugin 등 플러그인 사용 및 output hash 관련은 Production 모드에서 사용하기   
https://webpack.kr/guides/build-performance/#avoid-production-specific-tooling



## production mode (prod.js)
https://webpack.kr/guides/production/

### (1) webpack-dev-server 사용 시 ouput 설정
### (2) TerserPlugin 
### (3) CSS minimize - CssMinimizerPlugin 사용 
https://webpack.kr/plugins/mini-css-extract-plugin/#minimizing-for-production
### (4) sourcemap 사용 지양 (빌드성능개선)
https://webpack.kr/guides/build-performance/#source-maps
### (5) (선택사항) output.pathInfo 끄기 
- webpack은 출력 번들에 경로 정보를 생성하는 기능이 있지만, 많은 모듈을 번들로 묶을 경우엔 가비지 컬렉션에 영향을 주어 해당 기능 끄는게 빌드성능에 좋음  
https://webpack.kr/guides/build-performance/#avoid-production-specific-tooling

※ tree shaking   
https://webpack.kr/guides/tree-shaking/



## package.json 설정
### (1) 환경옵션 --env 로 development, production 빌드 실행
https://webpack.kr/guides/environment-variables/
```
npx webpack --env goal=local --env production --progress 
```
※  --mode와 --env 차이



## Typescript
https://webpack.kr/guides/typescript/

### (1) typescript 및 ts-loader 설치
```
npm install --save-dev typescript ts-loader
```
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
### (3) webpack loader에 ts-loader 추가
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


