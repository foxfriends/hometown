'use strict';
module.exports = {
    output: {
        filename: 'hometown.js'
    },
    module: {
        loaders: [
            { test: /\.es6$/, loader: 'babel' },
            // Tests need mocha loader
            { test: /test.*\.es6$/, loader: 'mocha!babel'},

            { test: /\.css$/, loader: 'style!css' }
        ]
    },
    devtool: 'source-map',
    watch: true
};
