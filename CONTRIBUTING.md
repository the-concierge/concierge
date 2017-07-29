## Requirements
The Concierge is written in TypeScript and uses an npm script to compile the project.  
Settings for [Visual Studio Code](https://code.visualstudio.com/) are included in the project.

### Installation
Clone the project and install the dependencies
```bash
git clone https://github.com/the-concierge/concierge
cd node-concierge
npm install
code .
```

### Building
If you are using VSCode, you can using the `Build` shortcut `Ctrl+Shift+B`.  
Otherwise from the `node-concierge` directory on the command line:
```bash
npm run build
```

### Debugging

If you are using VSCode, set your breakpoints and use the `Debug` shortcut `F5`.  
Otherwise from the `node-concierge` directory on the command line:  
```bash
# Note tha
t
# Option 1: Do not break at the start (Node v6.4+ required)
npm run debug

# Option 2: Do not break at the start (Node v6.4+ required)
node --inspect .

# Option 3: Break at the start (Node v6.4+ required)
node --inspect --debug-brk .

# Option 4: Using node-inspector (Where Node >=6.4 is not available)
# Do not break at the start
npm install node-inspector -g
node-debug src/index.js

# Option 5: Break at the start
node-debug --debug-brk src/index.js
```

### Contributing
- Create an Issue before creating a Pull Request
- Reference the Issue from the Pull Request
- Merge against the `development` branch



