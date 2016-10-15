// Import path is relative to ./libs due to cajon-config baseUrl path
require(['../components/index'], (render: Render) => {
    render.default();
});

type Render = { default: () => void };
