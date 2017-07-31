import { Router } from 'express'
import start from './start'
import stop from './stop'
import remove from './remove'
import stats from './stats'
import logs from './logs'

const router = Router()

router.get('/:id/start/:hostid', start)
router.get('/:id/stop/:hostid', stop)
router.get('/:id/remove/:hostid', remove)
router.get('/:id/stats', stats)
router.get('/:id/logs/:hostid', logs)
router.delete('/:id/host/:hostid', remove)

export default router