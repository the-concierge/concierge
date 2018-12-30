<template>
  <div class="container">
    <div class="columns">
      <div class="column col-2">
        <b>Id</b>
      </div>
      <div class="column col-10">{{container.Id}}</div>

      <div class="column col-2">
        <b>Image</b>
      </div>
      <div class="column col-10">{{container.Image}}</div>

      <div class="column col-2">
        <b>State</b>
      </div>
      <div class="column col-10">{{container.State}}</div>

      <div class="column col-2">
        <b>Status</b>
      </div>
      <div class="column col-10">{{container.Status}}</div>

      <div class="column col-2">
        <b>Urls</b>
      </div>
      <div class="column col-10">
        <table class="table">
          <tbody>
            <tr v-for="(url, i) of urls" :key="i">
              <td>
                <strong>{{url.port}}</strong>
              </td>
              <td>
                <a v-bind:href="url.internal" target="_blank">{{url.internal}}</a>
              </td>
              <td>
                <a
                  v-bind:href="url.external.withoutPort"
                  target="_blank"
                >{{url.external.withoutPort}}</a>
              </td>
              <td>
                <a v-bind:href="url.external.withPort" target="_blank">{{url.external.withPort}}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="column col-2">
        <b>Data In/Out</b>
      </div>
      <div class="column col-10">
        <span>{{container.stats.mbIn}}</span> /
        <span>{{container.stats.mbOut}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Container, Configuration } from '../api'

interface Url {
  port: number
  internal: string
  external: {
    withPort: string
    withoutPort: string
  }
}

export default Vue.extend({
  props: {
    container: { type: Object as () => Container },
    config: { type: Object as () => Configuration }
  },
  computed: {
    urls: function(): Url[] {
      if (!this.container) {
        return []
      }

      const cfg = this.config
      const ports = portsToUrls(this.container)
      const name = this.container.Names[0].slice(1)
      const urls = ports.map(port => {
        const internal = port.url
        const withPort = `http://${name}-${port.private}.${cfg.proxyHostname}:${cfg.conciergePort}`
        const withoutPort = `http://${name}-${port.private}.${cfg.proxyHostname}`
        return {
          port: port.private,
          internal,
          external: {
            withPort,
            withoutPort
          }
        }
      })

      return urls
    }
  }
})

function portsToUrls(container: Container) {
  const ports = container.Ports
  const hostname =
    container.concierge.host.vanityHostname || container.concierge.host.hostname || 'localhost'
  return ports
    .filter(port => port.Type === 'tcp')
    .filter(port => port.hasOwnProperty('PublicPort'))
    .map(port => ({ url: `http://${hostname}:${port.PublicPort}`, private: port.PrivatePort }))
}
</script>
