import * as ko from 'knockout'
import state from '../../state'
import { activeContainerId } from '../common'
import { BoxData } from 'analysis'
import * as hs from 'highcharts'
require('highcharts/highcharts-more.js')(hs)
require('highcharts/modules/exporting.js')(hs)

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

  updateChart = (elementId: string, chartName: string, boxes: BoxData[]) => {
    const mean = boxes.reduce((prev, curr) => prev + curr.mean, 0) / boxes.length

    /**
     * Series data format:
     * [minimum, lower quartile, median, upper quartile, maximum]
     */
    const data: any = boxes.map((box, index) => [
      this.timestamp[index],
      box.range.minimum,
      box.lowerQuartile,
      box.median,
      box.upperQuartile,
      box.range.maximum
    ])

    const firstSample = new Date(this.timestamp[0] || Date.now()).toLocaleString()
    const lastSample = new Date(this.timestamp.slice(-1)[0] || Date.now()).toLocaleString()

    hs.chart(elementId, {
      chart: { type: 'boxplot', zoomType: 'x' },
      title: { text: `${chartName}: ${firstSample} - ${lastSample}` },
      legend: { enabled: true },
      xAxis: {
        type: 'datetime',
        title: { text: 'Time' },
        labels: {
          formatter: function(this: { value: number }) {
            return new Date(this.value).toTimeString().slice(0, 8)
          }
        }
      },
      yAxis: {
        title: { text: `${chartName} Percentage` },
        plotLines: [
          {
            value: mean,
            color: 'red',
            width: 1,
            label: {
              text: `Theorhetical mean: ${mean}`,
              align: 'center',
              style: { color: 'grey' }
            }
          }
        ]
      },
      series: [
        {
          name: 'Percentage',
          data,
          tooltip: {
            xDateFormat: '%H:%M:%S'
          }
        }
      ] as any
    })
  }

  getStats = async () => {
    const containerId = activeContainerId()
    const result = await fetch(`/api/containers/${containerId}/stats`)
    if (result.status >= 400) {
      state.toast.error(`Failed to retrieve container stats: ${result.statusText}`)
    }

    const stats = (await result.json()) as RawStats
    const parsedStats = stats.reduce(
      (prev, stat) => {
        prev.cpu.push(JSON.parse(stat.cpu))
        prev.memory.push(JSON.parse(stat.memory))
        prev.timestamp.push(stat.timestamp)
        return prev
      },
      { cpu: [] as any[], memory: [] as any[], timestamp: [] as any[] }
    )

    this.timestamp = parsedStats.timestamp
    this.updateChart('cpu-chart', 'CPU Usage', parsedStats.cpu)
    this.updateChart('memory-chart', 'Memory Usage', parsedStats.memory)

    return parsedStats
  }
}

const viewModel = new Performance()

ko.components.register('ko-container-stats', {
  template: require('./stats.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
