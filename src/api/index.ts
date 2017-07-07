import { Router } from 'express'
import hosts from './hosts'
import containers from './containers'
import images from './images'
import applications from './applications'
import config from './configuration'

const router = Router()

router.use('/hosts', hosts)
router.use('/containers', containers)
router.use('/images', images)
router.use('/applications', applications)
router.use('/configuration', config)

export default router
