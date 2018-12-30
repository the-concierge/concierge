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
            <button class="btn btn-md" v-on:click="showEditHost(h)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Create/>
    <Edit/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Host } from './api'
import Create, { showModal as showCreate } from './hosts/Create.vue'
import Edit, { showModal as showEdit } from './hosts/Edit.vue'

export default Vue.extend({
  components: { Create, Edit },
  props: {
    hosts: { type: Array as () => Host[] }
  },
  methods: {
    showEditHost(host: Host) {
      showEdit(host)
    },
    showCreateHost() {
      showCreate()
    }
  }
})
</script>

