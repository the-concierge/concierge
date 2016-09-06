# Host

_Warning: Fiddly_

**Host Requirements**
- Linux
- Docker
 - See Docker website for installation instructions
- SSH Server
 - Most Linux environments come with an SSH server.
 - If not, install OpenSSH server using `sudo apt-get install openssh-server`

**Create a User**
The Concierge will need credentials to connect to the Host. This user should be isolated from other users and doesn't need any special privileges.  
```
sudo adduser [username]
```

Just using a password isn't very secure. We should use Public Key authentication.

```
sudo su - [username]
ssh-keygen -t rsa -N ''
cp ~/.ssh/id_rsa.pub ~/.ssh/authorized_keys
cat ~/.ssh/id_rsa
exit
```
- `sudo su - [username]` Open a shell as [username]  
- `ssh-keygen` Generate a new RSA key pair  
- `-t rsa` Use the RSA cryptosystem  
- `-N ''` Don't use a passphrase  
- `cp ~/.ssh/id_rsa.pub ~/.ssh/authorized_keys` Copy the contents of the public key to `authorized_keys`
 - This allows the newly generated private key to access the newly created account via SSH
- `cat ~/.ssh/id_rsa` Output the contents of the private key to the console  
- `exit` Log out of [username]'s shell

The output of `cat` is what is entered into the `SSH Private Key` field in the Hosts view when creating a new Host

 #### Why Linux?
 Linux has better support for Docker and the SSH server.  
 Windows requires Windows 10 and Hyper-V. These requirements may conflict or may simply be too high.  
 The Windows client is also more difficult to configure and the documentation mostly ignores the Windows client. 

**Docker Configuration**
Add the following line to the `/etc/default/docker` file:
 - `DOCKER_OPTS="--insecure-registry 192.168.1.0/24 -H unix:///var/run/docker.sock -H tcp://0.0.0.0:2375"`
 - Restart the Docker service (`sudo service docker restart`)

**Breakdown of Configuration** 

`--insecure-registry`  
This allows Docker to push and pull images from an "insecure" registry.  
In this scenario, this is considered safe because the registry we'll be using is private and internal.  
This means each Docker Host we set up does not need to be provisioned with private keys for access to the registry.

`192.168.1.0/24`  
This specifies all IP address from 192.168.1.1 to 192.168.1.255.  
This means we can connect to any insecure registry in that IP range.

`-H unix:///var/run/docker.sock`  
This creates a local socket to ensure Docker can still be consumed from the command line

`-H tcp://0.0.0.0:2375`  
This creates a TCP socket that will listen for Docker commands.  
This allows the Concierge to remotely execute Docker commands on the Host.