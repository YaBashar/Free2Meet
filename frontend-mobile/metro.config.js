const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { createProxyMiddleware } = require("http-proxy-middleware");

/** Backend origin Metro forwards API paths to during development. */
const BACKEND_URL = process.env.EXPO_PUBLIC_API_PROXY_TARGET ?? "http://127.0.0.1:3229";

/** Paths the mobile client sends to the packager origin; see `src/lib/api/client.ts`. */
const API_PATH_PREFIXES = ["/auth", "/events", "/attendees", "/clear"];

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => {
    const proxy = createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
    });

    return (req, res, next) => {
      const pathname = (req.url ?? "").split("?")[0];
      const shouldProxy = API_PATH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );

      if (shouldProxy) {
        return proxy(req, res, next);
      }

      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
