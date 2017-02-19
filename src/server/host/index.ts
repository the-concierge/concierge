import { Router } from 'express'
import one from './one'
import all from './all'
import update from './update'
import containers from './container'

const router = Router()

router.get('/', all)
router.get('/:id', one)
router.post('/', update)
router.get('/:id/containers', containers)

export default router