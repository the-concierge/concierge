<script lang="ts">
import Vue from 'vue'
import SafeLink from './SafeLink.vue'
import { Container } from './api'

interface Data {
  onlyShowRunning: boolean
}

export default Vue.extend({
  props: ['containers'],
  data: function(): Data {
    return {
      onlyShowRunning: true
    }
  },
  computed: {
    filteredContainers: function() {
      const containers: Container[] = this.containers
      return containers.filter(container => {
        if (!this.onlyShowRunning) {
          return true
        }

        return container.State === 'running'
      })
    }
  },
  components: { SafeLink },
  methods: {
    toUrl(id: string) {
      return `/inspect/${id}`
    }
  }
})
</script>

<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <!-- <select class="form-select" data-bind="options: hosts, optionsText: 'hostname', value: selectedHost">
          </select>-->
          <div class="dropdown">
            <div class="btn-group">
              <a href="#" class="btn dropdown-toggle">Options ▼</a>

              <ul class="menu" style="min-width: 200px">
                <label class="form-checkbox">
                  <input type="checkbox" v-model="onlyShowRunning">
                  <i class="form-icon"></i> Only Show Running
                </label>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-10"></div>
      </div>
    </div>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Id</th>
          <th>Image</th>
          <th>State</th>
          <th>Status</th>
          <th style="min-width: 150px">CPU</th>
          <th style="min-width: 150px">Memory</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in filteredContainers" v-bind:key="c.Id">
          <td style="padding: 3px">
            <SafeLink
              v-bind:url="toUrl(c.Id)"
              class="btn btn-link"
            >{{ (c.Names[0] || '/Unknown').slice(1) }}</SafeLink>
          </td>
          <td style="padding: 3px">{{c.Id.slice(0, 10)}}</td>
          <td style="padding: 3px">{{c.Image}}</td>
          <td style="padding: 3px">{{c.State}}</td>
          <td style="padding: 3px">{{c.Status}}</td>
          <td style="padding: 3px">{{c.stats.cpu}}</td>
          <td style="padding: 3px">{{c.stats.memory}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style scoped>
td {
  padding: 3px;
}
</style>
