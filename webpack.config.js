const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");

const paths = {
    src: path.resolve(__dirname, "src"),
    build: path.resolve(__dirname, "dist"),
};

module.exports = (env, argv) => {
    return {
        entry: "./src/index.js",
        output: {
            path: paths.build,
            filename: "[name].js",
        },
        resolve: {
            alias: {
                "@": paths.src,
            },
        },
        target: "web",
        optimization: {
            minimize: true,
            minimizer: [
                new TerserJSPlugin({}),
                new OptimizeCSSAssetsPlugin({}),
            ],
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/].*\.js$/,
                        chunks: "all",
                    },
                },
            },
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                },
                {
                    test: /\.pug$/,
                    use: {
                        loader: "pug-loader",
                        options: {
                            pretty: true,
                        },
                    },
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        argv.mode === "development"
                            ? {
                                  loader: "style-loader",
                              }
                            : {
                                  loader: MiniCssExtractPlugin.loader,
                                  options: {
                                      publicPath: "../",
                                  },
                              },
                        "css-loader",
                        "postcss-loader",
                        "fast-sass-loader",
                    ],
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    include: /images/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[name].[ext]",
                            },
                        },
                        {
                            loader: "image-webpack-loader",
                            options: {
                                mozjpeg: {
                                    progressive: true,
                                    quality: 65,
                                },
                                optipng: {
                                    enabled: false,
                                },
                                pngquant: {
                                    quality: [0.3, 0.5],
                                    speed: 4,
                                },
                                gifsicle: {
                                    interlaced: false,
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    use: {
                        loader: "file-loader",
                        options: {
                            name: "fonts/[name].[ext]",
                        },
                    },
                },
            ],
        },
        plugins: [
            ...fs
                .readdirSync(path.resolve(__dirname, "src//pages"))
                .filter((fileName) => fileName.endsWith(".pug"))
                .map(
                    (page) =>
                        new HtmlWebpackPlugin({
                            minify: false,
                            template: `${paths.src}/pages/${page}`,
                            filename: `./${page.replace(/\.pug/, ".html")}`,
                        })
                ),
            new MiniCssExtractPlugin({
                filename: "./css/[name].css",
                chunkFilename: "[name].css",
            }),
            new CleanWebpackPlugin({
                dry: true,
                cleanOnceBeforeBuildPatterns: ["dist/*"],
            }),
            new DuplicatePackageCheckerPlugin(),
        ],
        devServer: {
            watchOptions: {
                ignored: /node_modules/,
            },
            hot: true,
            host: process.env.HOST,
            port: process.env.PORT,
            overlay: {
                errors: false,
                warnings: false,
            },
        },
    };
};
