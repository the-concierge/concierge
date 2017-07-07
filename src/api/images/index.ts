import { Router } from 'express'
import * as get from './get'
import inspect from './inspect'
import run from './run'
import remove from './remove'

const router = Router()

router.get('/', get.all)
router.get('/:id', get.one)
router.get('/:id/inspect/:hostId', inspect)
router.post('/run', run)
router.delete('/', remove)

export default router