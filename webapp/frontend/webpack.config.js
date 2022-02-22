const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'index.bundle.js',
    },
    devServer: {
        port: 3000,
        proxy: {
            '/api': {
                 target: 'http://localhost:3000',
                 router: () => 'http://backend:8080',
            }
         }
    },
    watchOptions: {
        aggregateTimeout: 500, // delay before reloading
        poll: 1000 // enable polling since fsevents are not supported in docker
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /nodeModules/,
                use: {
                    loader: 'babel-loader'
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.png$/,
                use: 'file-loader',
            },
        ]
    },
    plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
}