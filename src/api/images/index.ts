import { Router } from 'express'
import * as get from './get'
import inspect from './inspect'
import run from './run'

const router = Router()

router.get('/', get.all)
router.get('/:id', get.one)
router.get('/:id/inspect/:hostId', inspect)
router.post('/run', run)

export default router