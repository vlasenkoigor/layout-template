const path = require('path');

module.exports = (env, argv)=>{


    return   {
        entry: { main: './src/index.ts' },
        output: {
            path: path.resolve(__dirname, ''),
            filename: 'main.js'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                }
            ]
        },
        devtool: 'cheap-source-map',
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        devServer: {
            liveReload: true
        }
    }

}



