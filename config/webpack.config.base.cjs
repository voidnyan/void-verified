const path = require("path");

const webpackConfig = {
	resolve: {
		extensions: [".js", ".ts"],
	},
	optimization: {
		minimize: false,
		moduleIds: "named",
	},
	entry: "./src/voidverified.user.js",
	output: {
		path: path.resolve(__dirname, "../dist"),
	},
	target: "web",
	// externals: {
	// 	lit: "lit",
	// },
	module: {
		rules: [
			{
				test: /\.m?ts$/,
				use: {
					loader: "ts-loader",
				},
			},
			{
				test: /\.less$/,
				use: ["style-loader", "css-loader", "less-loader"],
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [],
};

module.exports = webpackConfig;
