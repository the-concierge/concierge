import * as Shell from './components/shell';

// Import path is relative to ./libs due to cajon-config baseUrl path
require(['../components/shell/index'], (shell: typeof Shell) => {
    shell.render();
});

type ShellModule = {
    render: () => void
}