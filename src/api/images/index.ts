import { Router } from 'express'
import * as get from './get'
import inspect from './inspect'
import run from './run'
import remove from './remove'
import pull from './pull'

const router = Router()

router.post('/run', run)
router.post('/pull', pull)
router.get('/', get.all)
router.get('/:id', get.one)
router.get('/:id/inspect/:hostId', inspect)
router.delete('/', remove)

export default router
