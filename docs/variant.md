# Variant
Pre-requisites:
- An [Application](application.md) has been created
- A [Host](host.md) has been created

### Create an Image/Variant
- Navigate to the `Variant` view
- Select the `Application`
- Select a `Tag`
- Click `Deploy`

This can take some time.

### What happens when I click Deploy ?

- The git repository will checkout the requested `tag`
- A host will issue a build command against the checked out code
 - The progress can be viewed in the Concierge `Event Log`
- Upon completion, the image will be pushed to the registry in the `Configuration`
- The Variant will be marked `Deployed` in the database

[![Analytics](https://ga-beacon.appspot.com/UA-61186849-1/node-concierge/docs/variant)](https://github.com/paypac/node-concierge)