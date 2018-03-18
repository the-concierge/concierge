import { Router } from 'express'
import hosts from './hosts'
import containers from './containers'
import images from './images'
import applications from './applications'
import queue from './queue'
import config from './configuration'
import credentials from './credentials'

const router = Router()

router.use('/hosts', hosts)
router.use('/containers', containers)
router.use('/images', images)
router.use('/applications', applications)
router.use('/configuration', config)
router.use('/credentials', credentials)
router.use('/queue', queue)

export default router
