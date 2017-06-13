import { Router } from 'express'
import hosts from './hosts'
import containers from './containers'

const router = Router()

router.use('/hosts', hosts)
router.use('/containers', containers)

export default router
