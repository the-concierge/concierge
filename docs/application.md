# Creating an Application

For private repositories, an **Access Token** and a **Private Key** are required

### Access Token
_N.B. This is only required for **private** repositories_  
It is highly recommended that you do not use your own account for this, but an account specifically used for deploys/builds/developement.  

#### Github
1. Log into the account that will house the Access Token
2. Head to [Personal access tokens](https://github.com/settings/tokens) in Settings
3. Create an access token with **repo** access

The **access token** is what is entered into the `Private Token` field of an Application

### Private Key
_N.B. This assumes you already know how to create an SSH keypair_  
_N.B. This is only required for **private** repositories_  
_N.B. The private key must be formatted in its original shape or it may be considered invalid_ 

Under _Settings_ in your Github or Gitlab account, you can add SSH and GPG keys.  
The Concierge will use SSH to retrieve code from a remote repository and will require a private to do so.  
The **public key** will need to be added to an Github/Gitlab account which has access to the repositories.   

The **private key** is what is entered into the `Private Key` field of an Application

[![Analytics](https://ga-beacon.appspot.com/UA-61186849-1/node-concierge/docs/application)](https://github.com/paypac/node-concierge)