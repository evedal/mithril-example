var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './app/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module : {
        loaders : [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015'],
                    plugins: [["transform-react-jsx", {
                        "pragma": "m"
                    }],
                        "transform-class-properties",
                        ]
                }
            }
        ]
    }
};