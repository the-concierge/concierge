import { Router } from 'express'
import * as get from './get'
import inspect from './inspect'

const router = Router()

router.get('/', get.all)
router.get('/:id', get.one)
router.get('/:id/inspect/:hostId', inspect)

export default router