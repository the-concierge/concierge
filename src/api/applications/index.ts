import { Router } from 'express'
import * as get from './get'
import create from './create'
import update from './update'
import refs from './refs'
import remove from './remove'
import deploy from './deploy'
import getAppLogs from './logs'
import getAppLog from './log'
import getBranches from './branches'

const router = Router()

router.get('/branches', getBranches)
router.get('/:id/branches', getBranches)
router.get('/:id/logs', getAppLogs)
router.get('/:id/logs/:filename', getAppLog)
router.get('/:id', get.one)
router.get('/', get.all)
router.get('/:id/refs', refs)
router.post('/', create)
router.post('/:id', update)
router.put('/:id/deploy', deploy)
router.delete('/:id', remove)

export default router
