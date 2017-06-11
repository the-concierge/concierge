import * as ko from 'knockout'
import * as fs from 'fs'

ko.components.register('ko-loading', {
  template: fs.readFileSync(`${__dirname}/loading.html`).toString()
})