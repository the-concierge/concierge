## Why does this folder exist?
Prior to the re-write of the Concierge to a general purpose tool, it used:
- Control "Hosts" over SSH
- Copy/Move containers (and their state) between Concierges
- Had some baked in business logic from when the Concierge was an interal/closed-source tool

This code will be retained until I have decided to either:
- Re-implement that behaviour and then the code can be re-used
- Not re-implement the behaviour

Chunks of this behaviour were quite difficult to implement so it'll save a lot of time to re-implement if some variation of this behaviour is going to be re-implemented
