import { Router } from 'express'
import one from './one'
import all from './all'
import oneContainer from './one-container'
import allContainers from './all-containers'
import clone from './clone'

const router = Router()

router.get('/', all)
router.get('/:id', one)
router.get('/container', allContainers) // TODO: Investigate, why no Concierge id?
router.get('/container/:id', oneContainer) // TODO: Investigate, why no Concierge id?
router.post('/clone', clone)

export default router