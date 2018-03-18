import { Router } from 'express'
import get from './get'

export { router as default }

const router = Router()
router.get('/', get)
