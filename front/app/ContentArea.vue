<script lang="ts">
import Vue from 'vue'
import { router } from './router'
import Containers from './Containers.vue'
import { VueConstructor } from 'vue/types/vue'

export interface Toast {
  state: string
  msg: string
  index: number
}

interface NavItem {
  component: VueConstructor<any>
  title: string
  active: boolean
}

export default Vue.extend({
  props: ['state'],
  components: {
    Containers
  },
  data() {
    return {
      view: 'containers',
      toasts: [],
      navItems: [
        {
          component: Containers,
          title: 'Containers',
          active: true
        }
      ] as NavItem[]
    }
  },
  mounted() {
    // TODO: Register toasts event-handler
  },
  methods: {
    navigate(path: string) {
      const parts = path.split('/')
      const resource = parts[0].slice(1)
      const component = router.dispatch([resource, parts, path])
      window.history.pushState({}, 'Concierge', path)

      if (component) {
        this.view = resource
        return
      }

      this.view = '404'
    }
  }
})
</script>

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
            <ul class="tab" v-for="item in navItems" v-bind:key="item.title">
              <li class="tab-item" v-bind:class="{ active: item.active }">
                <span>{{ title }}</span>
              </li>
            </ul>
          </section>
          <section class="navbar-center"></section>
        </header>
      </div>
    </div>

    <Containers v-show="view === 'containers'" v-bind:containers="state.containers" />

    <div v-for="toast in toasts" v-bind:key="toast.index">
      <div style="position: fixed; bottom: 20px; right: 50px">
        <div class="toast" v-bind:class="toast.state">
          <button class="btn btn-clear float-right" v-on:click="remove"></button>
          <span>{{ toast.msg }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

