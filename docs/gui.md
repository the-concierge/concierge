The visual layer of the Concierge is a single page application using Knockout and some legacy 'Re-usable lists' code.
The routing uses components and does not using the History API of the browser.

# Glossary

- App Data
 - All of the files stored inside a Docker container's volumes 
- Docker ID
 - The identifier of a Docker container provided by the Docker application that uniquely identifies the container
- Docker image
 - See the [Docker documentation](https://docs.docker.com/v1.8/userguide/dockerimages/)
- Docker registry
 - See the [Docker documentation](https://docs.docker.com/registry/)
- Git tag
 - See the [Git documentation](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- Host
 - A server that provides access via SSH that has Docker installed and configured according to the setup instructions in `README.md`
- Heartbeat
 - A periodic `GET /` request sent to all containers which is timed and recorded for diagnostic/monitoring purposes 
- Proxy Hostname
 - The base domain that is used as the basis for all subdomains
 - E.g. Given the Proxy Hostname `mypaypac.com.au`, a container with the subdomain `example` would be accessed via `example.mypaypac.com.au` is Proxying is enabled
- Tag
 - See the `Git tag`
- Variant
 - A variant represents the Docker Image of an Application at a particular point in time using the `Git Tag` as the reference point.
 - The source code of the Application is fetched at the commit that the `Git Tag` points
 - the [Docker build](https://docs.docker.com/v1.8/reference/commandline/build/) command is executed against this source code.
 - If the Docker build successfully completes, the resulting Docker image is pushed to the `Docker registry` and can now be used to create `Containers` 
- Volume
 - See `App Data`



# Containers

The Containers view is a visual representation of the `Containers` table

## View
- `Id` Primary key
- `Label` A description of the container for human consumption.
- `Subdomain` The subdomain of the `Configuation.Proxy Hostname`
- `Variant` Which variant of the `Application` the container is running
- `Memory` Current percentage of hosts memory (RAM) the container is using
- `CPU` Current CPU utilisation of the hosts CPU the container is using
- `Location` The raw URL of the container. Note: This is accessible even with `Is Active` is off.
- `Is Active` Whether the container can be accessed via its proxy URL (`Subdomain`.`Proxy Hostname` URL)
- `Variables` Environment variables the container was provisioned with
- `Docker ID` The ID of the docker container on the `Host`

## Actions
- `Information` Container control (stop, start, delete) and container status
- `Statistics` CPU and Memory over time
- `Download App Data` Will download an archive (`tar.gz` format) of the container volume data
- `Change Variant` This will:
 - Stop the container
 - Extract the volume data
 - Create a new container of the selected `Variant` with the same volume data, environment variables, label and subdomain
 - Start the new container
 - Archive the original volume data
 - Delete the original container
- `Fork Container` Will create a copy the container with the same `App Data`
- `Edit` Allows editing of the label

# Variants

## View
- `Application` Which application this is a variant of
- `Tag` The Git tag used to create the variant
- `Build Status` The state of the variant: `Deleted`, `NotDeployed`, `Deployed`, `Failed`
- `Build Time` The date and time the build was started

## Deploy Dropdowns
- Left: The application to deploy
- Right: The tag of the application to deploy 
- `Deploy`: Deploy the select Application Tag
- `Refresh`: Refresh the list of tags

## Actions
- `Bin` icon: Delete the variant

# Applications

Applications refer to Git repositories.  
In order for an Application to be deployable by the Concierge, it must have a `Dockerfile` at the root of the project.  
The repository can be public or private which is indicated by whether or not the private token/key are provided.

## View
- `Name` Human readable name assigned to the application
- `Repository` The `owner/repository` address of the repository.
 - E.g. `paypac/titan`
 - I.e. What comes after github.com/ or gitlab.com/ to reach the repository
- `API Type` Where the repository is hosted (Gitlab or Github)
- `Private Token` (Optional) API Token from a Github or Gitlab account which has access to the repository
- `Private Key` (Optional) The RSA private key to an Github or Gitlab account which provides access to the repository code
- `Docker namespace` How the docker images will be labeled when pushed to the docker registry when building a variant
 - E.g. `paypac/titan`
 - Behind the scenes, deploying a variant creates a _Docker image_.
 - This Docker image will be pushed to the _Docker registry_
 - The Docker image needs to be pushed to a _namespace_ on the registry, similar to a Git repository namespace

- `Variables (View/Edit)` The environment variables that containers will be provisioned with when created
 
## Actions
- `Edit`
- `Delete`
- `Save`
- `Undo`

# Hosts

Hosts refer to an SSH server that is running Docker that will run `Containers`.  
Since Hosts are just servers running SSH+Docker, they can be distributed which enables a horizontal scaling model.

## View
- `Hostname` The IP of the Host
- `Capacity` The amount of containers that the Concierge is permitted to run on the Host
- `Docker Port` The TCP port of the Docker socket.
 - This port is configured when provisioning the Docker host
- `SSH Port` The port for accessing the SSH server
- `SSH Username` The username used for accessing the SSH server
- `SSH Key` The private RSA key or the password (not recommended) for accessing the SSH server
 - The SSH key is never sent to the client and will always display as asterisks.

## Actions
- `Edit`
- `Delete`
- `Save`
- `Undo`

# Concierges

It is possible to add details for communicating with other Concierges.  
This provides functionality for:
- Viewing containers on the Concierge
- Cloning containers on the Concierge
- Downloading the App Data from containers on the Concierge

## View
- `Label` Human readable name assigned to the Concierge
- `Hostname` The IP or hostname used to connect to the Concierge
- `Port` Port number of the Concierge service (typically 3141)

## Actions
- `View Containers` Opens a modal with a list of containers on the Concierge
- Container Actions:
 - `Clone Container` Same as `Containers`.`Fork` but will be performed against the remote container
 - `Download Volume` Downloads the Container App Data as an archive (`.tar.gz`)

# Configuration

- `Name` Human readable name assigned to this Concierge
 - This defaults to the _computer name_ of the server running the Concierge
- `Concierge: Web Port` The web server port of the Concierge (defaults to `3141`)
- `Concierge: Use HTTPS` Create certificates for subdomains and use HTTPS to all container access via proxy
 - N.B. This does not apply retroactively (See TODO.md)
- `Concierge: HTTP Proxy Port`: When HTTP is used, which port is used to access the containers via the proxy
 - E.g. http://`subdomain`.`proxyHostname`:`httpProxyPort`/
 - This is also as the _Challenge_ port when creating certificates
- `Concierge: HTTPS Proxy Port`: When HTTPS is used, which port is used to access the containers via the proxy
 - E.g. https://`subdomain`.`proxyHostname`:`httpsProxyPort`/
- `Concierge: Proxy Hostname`: Which hostname the proxy will accept requests on
 - N.B. This hostname is also used as the suffix in the domain name when creating SSL certificates
- `Concierge: Inbound Server IP`: The IP that the proxy server(s) will accept connections on.
 - Defaults to '0.0.0.0' which is "accept on all IPs this server has"
- `Concierge: Debug Mode`: Whether `log.debug` messages appear in the console
- `Container: Minimum uptime`: When attempting to start a container, the minimum amount of time (in milliseconds) the container must stay alive to be considered a _successful start_
- `Container: Maximum retries`: How many consecutive _failures to start_ we will allow
 - When a container fails to start, it may be restarted automatically (if the configuration above permits it)
- `Heartbeats: Frequency (ms)`: How often _heartbeat_ requests are sent to containers
- `Docker: Registry URL`: The fully qualified URL of the Docker registry that the Concierge will use to push Docker images to
 - The URL *MUST* be in `HOSTNAME/IP`:`PORT` format

 [![Analytics](https://ga-beacon.appspot.com/UA-61186849-1/node-concierge/docs/gui)](https://github.com/paypac/node-concierge)