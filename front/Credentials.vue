<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <button class="btn btn-md" v-on:click="showCreateModal">Create</button>
          <button class="btn btn-md" v-on:click="refresh">Refresh</button>
        </div>

        <div class="col-10">
        </div>
      </div>
    </div>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>

          </th>
        </tr>
      </thead>
      <tbody v-for="c in credentials" :key="c.id">
        <tr>
          <td data-bind="text: name">{{c.name}}</td>
          <td data-bind="text: username">{{c.username}}</td>
          <td>
            <button class="btn btn-md" v-on:click="showEditModal(c)">Edit</button>
            <button class="btn btn-md" v-on:click="removeCredentials(c)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Create />
    <Edit />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Credential } from './api'
import Create, { showModal as showCreate } from './credentials/Create.vue'
import Edit, { showModal as showEdit } from './credentials/Edit.vue'
import { refresh } from './common'

export default Vue.extend({
  components: { Create, Edit },
  props: {
    credentials: { type: Array as () => Credential[] }
  },
  methods: {
    showCreateModal() {
      showCreate()
    },
    refresh() {
      refresh.credentials()
    },
    showEditModal(creds: Credential) {
      showEdit(creds)
    },
    removeCredentials(_creds: Credential) {}
  }
})
</script>

