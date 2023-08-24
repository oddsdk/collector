module.exports = function(api) {
  api.cache(true);
  return {
    plugins: [
      [
        "@babel/plugin-transform-modules-commonjs",
        {
          allowTopLevelThis: true,
        },
      ],
      ["@babel/plugin-transform-private-methods", { loose: true }],
      "nativewind/babel",
      [
        "babel-plugin-rewrite-require",
        {
          aliases: {
            // crypto: "expo-crypto",
          },
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};
