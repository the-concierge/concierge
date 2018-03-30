
<script lang="ts">
import Vue from 'vue'
import { Application, Image, Remote } from './api'
import { State } from '../../src/api/applications/types'

export default Vue.extend({
  props: {
    applications: { type: Array as () => Application[] },
    images: { type: Array as () => Image[] },
    remotes: { type: Array as () => Remote[] }
  },
  methods: {
    getImages(app: Application) {
      return this.images.filter(i => i.name.indexOf(app.label) === 0)
    },
    getRemotes(app: Application) {
      return this.remotes
        .filter(r => r.applicationId === app.id && r.state !== 4)
        .filter(r => r.state !== State.Inactive)
    }
  }
})
</script>

