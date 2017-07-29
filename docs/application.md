# Creating an Application

For private repositories, a **Private Key** is required

### Private Key
_N.B. This assumes you already know how to create an SSH keypair_  
_N.B. This is only required for **private** repositories_  
_N.B. The private key must be formatted in its original shape or it may be considered invalid_ 

Under _Settings_ in your Github or Gitlab account, you can add SSH and GPG keys.  
The Concierge will use SSH to retrieve code, branch names, and tags from a remote repository and will require a private to do so.  

The **private key** is what is entered into the `Private Key` field of an Application

[![Analytics](https://ga-beacon.appspot.com/UA-61186849-1/node-concierge/docs/application)](https://github.com/paypac/node-concierge)