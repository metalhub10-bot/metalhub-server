const express = require('express');
const router =mexpress.Router();
const requireAuth = require('../middleware/requireAuth');
const { getPublications,
    getMyPublications,
    getPublicationDetail,
    createPublication,
    updatePublication,
    deletePublication,
    pausePublication,
    publishPublication
} = require('../controllers/industryPublication.controller');


router.get('/', getPublications)
router.get('/mine', requireAuth, getMyPublications)
router.get('/:slug', getPublicationDetail)
router.post('/', requireAuth, createPublication)
router.put('/:id', requireAuth, updatePublication)
router.delete('/:id', requireAuth, deletePublication)
router.patch('/:id/pause', requireAuth, pausePublication);
router.patch('/:id/publish', requireAuth, publishPublication);

module.exports = router;