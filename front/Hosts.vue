<template>
  <div>
    <button class="btn btn-md" v-on:click="showCreateHost">Create Host</button>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Hostname</th>
          <th>Proxy IP</th>
          <th>Vanity Hostname</th>
          <th>Capacity</th>
          <th>SSH Port</th>
          <th>Docker Port</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-for="h in hosts" :key="h.id">
        <tr>
          <td>{{ h.hostname || 'none set' }}</td>
          <td>{{ h.proxyIp }}</td>
          <td>{{ h.vanityHostname }}</td>
          <td>{{ h.capacity }}</td>
          <td>{{ h.sshPort }}</td>
          <td>{{ h.dockerPort }}</td>
          <td>
            <button class="btn btn-md" v-on:click="showEditHost">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- <ko-edit-host></ko-edit-host> -->

    <Create />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Host } from './api'
import Create, { showModal as showCreate } from './hosts/Create.vue'

export default Vue.extend({
  components: { Create },
  props: {
    hosts: { type: Array as () => Host[] }
  },
  methods: {
    showEditHost() {
      console.log('ShowEditHost')
    },
    showCreateHost() {
      showCreate()
    }
  }
})
</script>

