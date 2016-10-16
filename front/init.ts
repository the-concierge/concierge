const deps = [
    'react',
    'redux',
    'react-dom',
    'react-redux',
    'socket.io-client',
    'aphrodite',
    'react-router'
]

// Import path is relative to ./libs due to cajon-config baseUrl path
require(['../components/index', ...deps], (render: Render) => {
    render.default();
});

type Render = { default: () => void };
