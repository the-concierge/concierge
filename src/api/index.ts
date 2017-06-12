import { Router } from 'express'
import hosts from './hosts'

const router = Router()

router.use('/hosts', hosts)

export default router
