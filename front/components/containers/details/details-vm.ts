import * as ko from 'knockout'
import * as fs from 'fs'
import { activeContainer } from '../common'

class Details {
  container = activeContainer
}

const viewModel = new Details()

ko.components.register('ko-container-details', {
  template: fs.readFileSync(`${__dirname}/details.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel