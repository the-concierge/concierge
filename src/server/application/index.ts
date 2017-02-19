import { Router } from 'express'
import all from './all'
import one from './one'
import update from './update'
import deploy from './deploy'

const router = Router()
router.get('/', all)
router.get('/:id', one)
router.post('/', update)
router.post('/:id/deploy', deploy)

export default router