<template>
  <div>
    <div class="columns">
      <div class="column col-12">
        <header class="navbar">
          <section class="navbar-section">
            <span style="margin-right: 5px; margin-top: 15px">
              <h5>
                <strong>Concierge</strong>
              </h5>
            </span>
            <ul class="tab" data-bind="foreach: displayItems">
              <li class="tab-item" data-bind="css: { active: $parent.item().name === name }">
                <ko-link class="btn btn-link" params="href: path">
                  <span data-bind="text: name"></span>
                </ko-link>
              </li>
            </ul>
          </section>
          <section class="navbar-center"></section>
        </header>
      </div>
    </div>
    <div class="container">
      <div data-bind="component: component"></div>
    </div>

    <div style="position: fixed; bottom: 20px; right: 50px">
      <div class="toast" data-bind="css: cls">
        <button class="btn btn-clear float-right" data-bind="click: remove"></button>
        <span data-bind="text: msg"></span>
      </div>
    </div>

  </div>
</template>



<script lang="ts">
import Vue from 'vue'
import { AppState, getAll } from './api'

export default Vue.extend({
  data() {
    const state: AppState = {
      containers: [],
      images: [],
      hosts: [],
      credentials: [],
      applications: [],
      remotes: [],
      config: {
        name: '',
        conciergePort: 0,
        proxyHostname: '',
        debug: 0,
        statsBinSize: 0,
        statsRetentionDays: 0,
        dockerRegistry: '',
        registryCredentials: 0
      }
    }
    return {state}
  },
  async mounted() {
    const newState = await getAll(this.state)
    this.state = newState
  }
})

</script>

<style>
  header {
    border-bottom: 2px solid #b2b8e5;
    padding-left: 10px;
    padding-right: 10px;
    margin-top: 5px;
    padding-top: 5px;
  }

  body {
    position: absolute;
    top: 0px;
    bottom: 20px;
    width: 100%
  }

  .modal-container {
    min-width: 40vw;
  }
</style>