import { Router } from 'express'
import * as get from './get'
import create from './create'
import update from './update'
import remove from './remove'

const router = Router()

router.get('/:id', get.one)
router.get('/', get.all)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

export default router
