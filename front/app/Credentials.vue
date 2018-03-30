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

    <!-- <ko-create-credentials></ko-create-credentials> -->

    <!-- <ko-edit-credentials></ko-edit-credentials> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Credential } from './api'

export default Vue.extend({
  props: {
    credentials: { type: Array as () => Credential[] }
  },
  methods: {
    showCreateModal() {},
    refresh() {},
    showEditModal(_creds: Credential) {},
    removeCredentials(_creds: Credential) {}
  }
})
</script>

