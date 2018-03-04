import { Router } from 'express'
import get from './get'
import update from './update'

const router = Router()

router.get('/', get)
router.post('/', update)

export default router
