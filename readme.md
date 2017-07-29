# Concierge

Docker orchestration with Node and TypeScript

## What does the Concierge do?
- It fetches source code from a Git repository by tag or branch
- It uses the Dockerfile provided or a custom Dockerfile elsewhere in the repository to build a Docker image 
- It pushes images to a Docker registry
- Allows configurable creation of containers from images
- It controls (stop/start/delete) the containers on all Hosts.
- Monitors memory and CPU usage of containers
- Runs a central web server to proxy requests to container

## How can I contribute?      
See the [Contribution Guide](./CONTRIBUTING.md)

## How do I set up a Concierge from scratch?

### To control your local install of Docker on Windows, Mac or Linux

After starting the concierge:
- Create a new `Host`
- Set the **Vanity** hostname to `localhost`, `127.0.0.1` or any other hostname your machine uses
- That's it!

### External Requirements*
- Docker Registry
 - The registry isn't needed for the Concierge to run, but is needed for Variant and Container operations
 - This registry should be private. I.e., only accessible inside a private network
- NodeJS 6.4+
 - This is to use the native V8 debugger

### Configuration

#### Environment Variables
- `CONCIERGE_DB_PATH`: The path to store the application's SQLite database
- `CONCIERGE_PORT`: The port for the HTTP server

#### Launch with custom values
- `path`: Location for the SQLite database
- `port`: Port for the HTTP API
```sh
# E.g.
> the-concierge --path=/Users/me/concierge.sqlite --port=3141
```

### Installation

#### Method 1: Global NPM package
**Install globally using NPM**
```sh
> npm install the-concierge -g
> the-concierge
```

#### Method 2: Docker
**Use the public Docker image**
```sh
# Specify the flag below to keep a local copy of the Concierge SQLite database
# -v /your/host/folder:/concierge/db

# With access to your local Docker socket
> docker run -dt -p 3141:3141 -v /var/run/docker.sock:/var/run/docker.sock --restart=always --name concierge theconcierge/concierge:latest

# Without access to your local Docker socket
> docker run -dt -p 3141:3141 --restart=always --name concierge theconcierge/concierge:latest
```

#### Method 3: Manual build
**Build and run manually**
- Clone the repository  
- Build the project with `yarn` or `npm`
- With `yarn`:
  - `yarn`
  - `yarn build`
- With `npm`
  - `npm install`
  - `npm run build`
  
**Running**
- `npm start` or `node .`

**Configuration**
Configure the Docker registry URL
- Navigate to the `Configuration` View
- Set `Docker: Registry URL` to the URL of the Docker Registry
 - See below for instruction for setting up a Docker Registry

## How do I set up a Docker registry?

### Using the Concierge
You can use the Concierge to pull and run the Docker Registry

1. Go to the `Images` view
2. Click on `Pull Image`
3. Enter image name `registy` and tag `latest`
4. Click `Pull`
5. 

### Manually
The simplest way to do this is to use the public [Docker image](https://hub.docker.com/_/registry/).
- `sudo docker pull registry:latest`
- `sudo docker run -d -p 5000:5000 --name=registry -v /var/registry:/var/lib/registry --restart=unless-stopped registry:latest`

`-d`  
detached mode. The terminal used to execute the command won't be attached to the new container input/output.

`-p hostPort:containerPort`  
exposed port. allows all hosts and concierges to connect to the registry.

`--name`  
human readable name of the container

`--restart=unless-stopped`  
always restart the container except at startup if the container has been manually stopped

`-v hostPath/containerPath`  
store data from the `containerPath` on the host at `hostPath`

`registry:latest`  
the name and tag of the Docker image we are using

## I want to create a Variant
To create a Variant, the following is required:
- At least one Host
- At least one Application
- A private registry is configured

### Hosts
At least one Host is required to create Containers and deploy Variants.  
See [Host.md](./docs/host.md)

### Applications
At least one Application should be set up.  
See  [Application.md](./docs/application.md)


## Clone Container From Another Concierge
- Head to the **Concierges** view and create a Concierge record
- Save the new record (`Actions` -> `Save All`)
- Choose `View Containers` from the Concierge Actions dropdown
- Choose `Clone Container` from the Container Actions dropdown
- Complete the dialog and and `Submit`

[![Analytics](https://ga-beacon.appspot.com/UA-61186849-1/node-concierge/readme)](https://github.com/paypac/node-concierge)