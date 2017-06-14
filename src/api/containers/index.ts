import { Router } from 'express'
import start from './start'
import stop from './stop'
import remove from './remove'

const router = Router()

router.get('/:id/start/:hostid', start)
router.get('/:id/stop/:hostid', stop)
router.get('/:id/remove/:hostid', remove)

export default router