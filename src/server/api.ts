import { Router } from 'express'
import application from './application'
import archive from './archive'
import concierge from './concierge'
import config from './configuration'
import container from './container'
import host from './host'
import image from './image'
import registry from './registry'
import vault from './vault'

const router = Router()

router.use('/application', application)
router.use('/archive', archive)
router.use('/concierge', concierge)
router.use('/configuration', config)
router.use('/container', container)
router.use('/host', host)
router.use('/image', image)
router.use('/registry', registry)
router.use('/vault', vault)

export default router