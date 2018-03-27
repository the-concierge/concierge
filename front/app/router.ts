import mm from 'multiple-dispatch'
import { VueConstructor } from 'vue'

type Component = VueConstructor<any>

export const router = mm<Component, any>({
  name: 'router',
  throw: false,
  ignoreArity: false,
  params: [
    {
      name: 'resource',
      isa: (resource, isaFunc) => isaFunc(resource)
    }
  ]
})
