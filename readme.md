# FAQ

- [Setting up a Host](./docs/host.md)
- [Setting up an Application](./docs/application.md)
- [Creating Variants](./docs/variant.md)
- [Creating Containers](./docs/container.md)

## Browser Targets
TypeScript is compiled to ES2015.  
This effectively means the browser targets are current major version minus one (-1) of:
- Chrome 
- Firefox
- Edge

## What should I know before starting?
- [How to create an SSH key pair](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)
- [How to add a public key to `authorized_keys` of a user account](http://askubuntu.com/questions/46424/adding-ssh-keys-to-authorized-keys)
- How to connect to an SSH server using Public Key Authentication
- [How to install Docker](https://github.com/seikho/vim-config/blob/master/docker.sh)
- [Disabling Password Authentication to an SSH server](http://askubuntu.com/questions/435615/disable-password-authentication-in-ssh)

## What does the Concierge do?
- It fetches source code from a Git repository by tag
- It uses the Dockerfile provided in the repository to build a Docker image which we call *Variants* or *Images*
- It pushes images to a Docker registry
- It tells servers (called *Hosts*) to create Docker containers from the Variant images
- It controls (stop/start/delete) the containers on all Hosts.
- Allows you to create copies of running containers
- Allows you to create copies of containers running on other Concierges
- Allows you to download the application data from running containers
- Allows you to provision new containers with custom application data
- Monitors memory and CPU usage of containers
- Runs a central web server to proxy requests to container
- Provides free SSL/HTTPS via the proxy

## How can I contribute?      
See the [Contribution Guide](./CONTRIBUTING.md)

## How do I set up a Concierge from scratch?

**External Requirements**
- Docker Registry
 - The registry isn't needed for the Concierge to run, but is needed for Variant and Container operations
 - This registry should be private. I.e., only accessible inside a private network
- NodeJS 6.4+
 - This is to use the native V8 debugger

**Installation**
- Clone the code
- `npm install --production`

**Running**
- `npm start` or `node .`

**Configuration**
Configure the Docker registry URL
- Navigate to the `Configuration` View
- Set `Docker: Registry URL` to the URL of the Docker Registry
 - See below for instruction for setting up a Docker Registry

## How do I set up a Docker registry?
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
