const path = require("path");
const fs = require("fs");
const htmlWebpackPlugin = require("html-webpack-plugin");
//自动打包html文件plugin
const miniCssExtractPlugin = require("mini-css-extract-plugin");
//将css提取为单独文件plugin
const { resolve } = require("path");

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

let entryObject = {};
let htmlWebpackPluginArray = [];

const url = path.join(__dirname, "./src");

const buildArray = fs.readdirSync(url).filter((v) => v.match(/^\w+$/));

buildArray.forEach((value) => {
  entryObject[value] = `./src/${value}/index.jsx`;
  htmlWebpackPluginArray.push(
    new htmlWebpackPlugin({
      template: "./src/" + value + "/index.html",
      chunks: [value],
      filename: "./" + value + ".html",
    })
  );
});

module.exports = {
  entry: entryObject,
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "../src/main/resources/static/"),
    // publicPath:"/public",//打包出来的所有路径前缀
    clean: false,
    //每次输出先清空文件夹
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(s[ac]ss)|(css)$/,
            use: [
              // "style-loader",
              miniCssExtractPlugin.loader,
              "css-loader",
              "sass-loader",
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: [["postcss-preset-env"]],
                  },
                },
              },
            ],
          },
          {
            test: /\.(m?js)|(jsx)$/,
            exclude: /(node_modules|bower_components)/,
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: {
                      version: 3,
                    },
                    targets: {
                      chrome: "60",
                      firefox: "60",
                      ie: "9",
                      safari: "10",
                      edge: "17",
                    },
                  },
                ],
                ["@babel/preset-react"],
              ],
              cacheDirectory: true,
            },
          },
          {
            test: /\.(jpg|png|gif|svg|jpeg)$/,
            type: "asset/resource",
            //asset/resource一定要用type选项
            generator: {
              filename: "img/[hash][ext]",
            },
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: "asset/resource",
            generator: {
              filename: "media/[hash][ext]",
            },
          },
          {
            test: /\.html$/,
            use: ["html-loader"], //只使用单个loader的时候可以使用loader选项，这里写loader:"html-loader是一样的"
            //html-loader将html转为字符串再进行编译输出，可以处理html中的资源标签中的连接，比如img标签的src连接
            //use数组中的每个loader可以扩展成一个对象，里面loader选项自动loader名，options选项指定其他内容
          },
        ],
      },
    ],
  },
  plugins: [
    ...htmlWebpackPluginArray,
    new miniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[name].css",
    }),
    // new UglifyJSPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  devServer: {
    contentBase: resolve(__dirname, "dist"),
    //将dist中的所有内容压缩并提供服务器
    compress: true,
    //压缩代码选项
    port: 8000,
    //端口号
    open: true,
    //自动打开浏览器
    hot: true,
    //每次调试重新编译启用热更新，即每次只重新编译被更改的文件，需要在入口js文件加入判别热更新模块的代码
  },
  // mode: "development",
  mode: "production",
};
