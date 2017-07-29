import { Router } from 'express'
import start from './start'
import stop from './stop'
import remove from './remove'
import stats from './stats'

const router = Router()

router.get('/:id/start/:hostid', start)
router.get('/:id/stop/:hostid', stop)
router.get('/:id/remove/:hostid', remove)
router.get('/:id/stats', stats)
router.delete('/:id/host/:hostid', remove)

export default router