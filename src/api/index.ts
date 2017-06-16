import { Router } from 'express'
import hosts from './hosts'
import containers from './containers'
import images from './images'

const router = Router()

router.use('/hosts', hosts)
router.use('/containers', containers)
router.use('/images', images)

export default router
