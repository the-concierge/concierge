import { Router } from 'express'
import all from './all'
import download from './download'

const router = Router()
router.get('/', all)
router.get('/:volume', download)

export default router