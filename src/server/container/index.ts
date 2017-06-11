import { Router } from 'express'
import get from './all'
import getRunning from './running'
import update from './update'
import create from './create'
import change from './change'
import fork from './fork'
import log from './log'
import stats from './stats'
import remove from './remove'
import start from './start'
import stop from './stop'
import volume from './volume'
import info from './info'

const router = Router()

router.get('/', get)
router.get('/running', getRunning)
router.post('/', update)
router.get('/:id/volume', volume)
router.put('/', create)
router.put('/:id/fork', fork)
router.get('/:id/info', info)
router.post('/:id/start', start)
router.post('/:id/stop', stop)
router.post('/:id/remove', remove)
router.post('/:id/change', change)
router.get('/:id/log', log)
router.get('/:id/stats', stats)

export default router