import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'
import { activeContainerId } from '../common'
import { BoxData, common } from 'analysis'
import * as c3 from 'c3'

type RawStats = Array<{
  cpu: string
  memory: string
  timestamp: number
}>

type ParsedStats = Array<{
  cpu: BoxData[]
  memory: BoxData[]
  timestamp: number
  date: Date
}>

type ExtractedData = {
  mean: Array<string | number>
  min: Array<string | number>
  max: Array<string | number>
  x: Array<number>
}

class Performance {
  cpu: BoxData[] = []
  memory: BoxData[] = []
  timestamp: number[] = []
  date: Date[] = []

  updateChart = (elementId: string, chartName: string, boxes: BoxData[]) => {
    const extracted = this.extractData(boxes)
    c3.generate({
      bindto: elementId,
      data: {
        columns: [
          extracted.mean,
          extracted.min,
          extracted.max
        ]
      },
      axis: {
        x: {
          type: 'indexed',
          label: 'Time HH:mm:ss',
          tick: {
            rotate: 90,
            count: 50,
            culling: {
              max: 25
            },
            format: (index: number) => {
              return new Date(extracted.x[Math.round(index)]).toTimeString().slice(0, 8)
            }
          }
        },
        y: {
          label: `${chartName} - Percent`,
          max: 100
        }
      }
    })
  }

  extractData = (boxes: BoxData[]) => {
    return boxes.reduce<ExtractedData>((prev, curr, index) => {
      prev.mean.push(common.round(curr.mean, 2))
      prev.min.push(common.round(curr.range.minimum, 2))
      prev.max.push(common.round(curr.range.maximum, 2))
      prev.x.push(this.timestamp[index])
      return prev
    }, { mean: ['Mean'], min: ['Min'], max: ['Max'], x: [] })
  }

  getStats = async () => {
    const containerId = activeContainerId()
    const result = await fetch(`/api/containers/${containerId}/stats`)
    if (result.status >= 400) {
      state.toast.error(`Failed to retrieve container stats: ${result.statusText}`)
    }

    const stats = await result.json() as RawStats
    const parsedStats = stats.reduce((prev, stat) => {
      prev.cpu.push(JSON.parse(stat.cpu))
      prev.memory.push(JSON.parse(stat.memory))
      prev.timestamp.push(stat.timestamp)
      prev.date.push(new Date(stat.timestamp))
      return prev
    }, { cpu: [], memory: [], timestamp: [], date: [] })

    this.timestamp = parsedStats.timestamp
    this.date = parsedStats.date
    this.updateChart('#cpu-chart', 'CPU Usage', parsedStats.cpu)
    this.updateChart('#memory-chart', 'Memory Usage', parsedStats.memory)

    return parsedStats
  }
}

const viewModel = new Performance()

ko.components.register('ko-container-stats', {
  template: fs.readFileSync(`${__dirname}/stats.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel