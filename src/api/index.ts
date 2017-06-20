import { Router } from 'express'
import hosts from './hosts'
import containers from './containers'
import images from './images'
import applications from './applications'

const router = Router()

router.use('/hosts', hosts)
router.use('/containers', containers)
router.use('/images', images)
router.use('/applications', applications)

export default router
