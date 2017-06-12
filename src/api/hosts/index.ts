import { Router } from 'express'
import * as hosts from './get'
import * as containers from './get-containers'

const router = Router()

router.get('/', hosts.getAll)
router.get('/containers', containers.getAll)

router.get('/:id', hosts.getOne)
router.get('/containers/:id', containers.getOne)

export default router