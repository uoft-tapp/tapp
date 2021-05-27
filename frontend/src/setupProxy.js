/**
 * This file is only used in debug mode when `react-scripts start` is running. It forwards calls
 * from the frontend to the backend on port `3000`.
 */
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://backend:3000",
            changeOrigin: true,
        })
    );
    app.use(
        "/public",
        createProxyMiddleware({
            target: "http://backend:3000",
            changeOrigin: true,
        })
    );
    app.use(
        "/debug",
        createProxyMiddleware({
            target: "http://backend:3000",
            changeOrigin: true,
        })
    );
    app.use(
        "/hash",
        createProxyMiddleware({
            target: "http://backend:3000",
            changeOrigin: true,
        })
    );
};
