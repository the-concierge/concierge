import * as ko from 'knockout'
import * as fs from 'fs'

class Body {}

const body = new Body()

ko.components.register('ko-body', {
  template: fs.readFileSync(`${__dirname}/body.html`).toString(),
  viewModel: {
    createViewModel: () => body
  }
})
