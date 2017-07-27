// Registry polyfills
import './polyfill'

// Register components
import './components'

import * as ko from 'knockout'
ko.applyBindings(document.body)