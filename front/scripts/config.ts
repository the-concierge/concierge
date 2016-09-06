require.config({
    baseUrl: 'scripts/libs',
    shim: {
        "jquery": {
            exports: "jQuery"
        },
        "bootstrap": {
            deps: ["jquery"],
        },
        "c3": {
            deps: ["d3"]
        }
    },
    map: {
        "css": "css",
        "text": "text"
    }
});


require(["../init"]);
