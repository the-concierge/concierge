import db from '../../data/connection'

export default function get(container: Concierge.Container) {
  return db('Heartbeats')
    .select()
    .where('containerId', container.id)
    .then(stats => stats.map(parseStats))
}

function parseStats(stats) {
  stats.cpu = JSON.parse(stats.cpu)
  stats.memory = JSON.parse(stats.memory)
  return stats
}