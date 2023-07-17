module.exports = function(api) {
  api.cache(true);
  return {
    plugins: [
      "nativewind/babel",
      [
        "babel-plugin-rewrite-require",
        {
          aliases: {
            crypto: "expo-crypto",
          },
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};
