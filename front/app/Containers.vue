<script lang="ts">
import Vue from 'vue'
import { router } from './router'

export { Containers as default }

const Containers = Vue.extend({
  props: ['containers']
})

router.override([(i: string) => i === 'containers'], () => Containers)
</script>

<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-2">
          <!-- <select class="form-select" data-bind="options: hosts, optionsText: 'hostname', value: selectedHost">
          </select> -->
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
      <tbody v-for="c in containers" v-bind:key="c.Id">
        <tr>
          <td style="padding: 3px">
            <a href="#" class="btn btn-link">
              {{(c.Names[0] || '/Unknown').slice(1)}}
            </a>
            <!-- <ko-link class="btn btn-link" params="href: '/containers/' + id() + '/inspect'"> -->
            <!-- </ko-link> -->
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


