import * as ko from 'knockout'
import * as fs from 'fs'

ko.components.register('ko-not-found', {
  template: fs.readFileSync(`${__dirname}/not-found.html`).toString()
})