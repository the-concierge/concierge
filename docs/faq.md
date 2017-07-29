# FAQ

- [Setting up a Host](host.md)
- [Setting up an Application](application.md)
- [Creating Containers](container.md)

## What should I know before starting?
- [How to create an SSH key pair](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)
- [How to add a public key to `authorized_keys` of a user account](http://askubuntu.com/questions/46424/adding-ssh-keys-to-authorized-keys)
- How to connect to an SSH server using Public Key Authentication
- [How to install Docker](https://github.com/seikho/vim-config/blob/master/scripts/docker.sh)
- [Disabling Password Authentication to an SSH server](http://askubuntu.com/questions/435615/disable-password-authentication-in-ssh)

## How do I set up a Concierge from scratch?

**Configuration**
Configure the Docker registry URL
- Navigate to the `Configuration` View
- Set `Docker: Registry URL` to the URL of the Docker Registry
 - See below for instruction for setting up a Docker Registry

## How do I set up a Docker registry?
The simplest way to do this is to use the public [Docker image](https://hub.docker.com/_/registry/).
- You can use the `create-registry` script
  - This uses a `docker-compose` script
  - This also requires `openssl` to be installed
  - To use the script, clone this repository and run `npm run create-registry`
- Alternatively you can look at the `create-registry` script in `package.json` and follow the steps it takes manually

### Hosts
At least one Host is required to create Containers and deploy Variants.  
See [Host.md](host.md)

### Applications
At least one Application should be set up.  
See  [Application.md](application.md)

## Clone Container From Another Concierge
**This feature is currently unavailable**
- Head to the **Concierges** view and create a Concierge record
- Save the new record (`Actions` -> `Save All`)
- Choose `View Containers` from the Concierge Actions dropdown
- Choose `Clone Container` from the Container Actions dropdown
- Complete the dialog and and `Submit`

[![Analytics](https://ga-beacon.appspot.com/UA-61186849-1/node-concierge/docs/faq)](https://github.com/paypac/node-concierge)