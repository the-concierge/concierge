import { Router } from 'express'
import start from './start'
import stop from './stop'

const router = Router()

router.get('/:id/start/:hostid', start)
router.get('/:id/stop/:hostid', stop)

export default router