module.exports = function(api) {
  api.cache(true);
  return {
    plugins: [
      // ["@babel/plugin-transform-private-methods", { loose: true }],
      "nativewind/babel",
      [
        "babel-plugin-rewrite-require",
        {
          aliases: {
            crypto: "expo-crypto",
            stream: "readable-stream",
            'stream/web': "readable-stream/web",
          },
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};
