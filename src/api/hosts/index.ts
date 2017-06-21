import { Router } from 'express'
import * as hosts from './get'
import * as containers from './get-containers'
import create from './create'

const router = Router()

router.get('/', hosts.getAll)
router.get('/containers', containers.getAll)

router.get('/:id', hosts.getOne)
router.get('/:id/containers', containers.getOne)

router.post('/', create)

export default router