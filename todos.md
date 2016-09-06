# TODOs

## Enhancements
- Reduce the number of data points in the Container statistics graph
 - To reduce UX latency when interacting with the chart
 - To improve readability of the chart 
- Remove Bootstrap
- Remove performance monitoring from performance history plot
 - This is to remove the memory leak introduced by the c3.js library
- ~Move subdomain blacklist to Configuration table~

## Features
- Enable downloading of historical performance data in for consumption by statistics programs
 - For programs such as R, Matlab, IPython, ...
 - Allow fetching between date ranges
- Implement SSH tunneling to Docker clients to remove the current 'internal network only' limitation
- Implement client-side routing
- Implement supporting multiple exposed ports
 - Currently only one is supported
- Implement batch updates
 - Update/Upgrade all containers from VaraintX to VariantY
- Re-use Nginx
 - Dynamically update Nginx configuration instead of having the Concierge front-facing
- Select which Host a Container will be created on
- Move a Container to another Host
- When forking/creating a Container, allow custom Environment Variables