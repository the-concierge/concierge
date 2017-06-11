// Polyfill fetch
import 'whatwg-fetch'

// Register components
import './components'

import * as ko from 'knockout'
ko.applyBindings(document.body)