import { Router } from 'express'
import * as get from './get'
import create from './create'
import update from './update'

const router = Router()

router.get('/:id', get.one)
router.get('/', get.all)
router.post('/', create)
router.put('/:id', update)

export default router
