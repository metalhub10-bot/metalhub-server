const express =
require('express');

const router =
express.Router();

const requireAuth =
require('../middleware/requireAuth');

const {

    getCategories,

    getCategoryDetail,

    createCategory,

    updateCategory,

    deleteCategory

} = require(
    '../controllers/industryCategory.controller'
);


router.get(
    '/',
    getCategories
);

router.get(
    '/:id',
    getCategoryDetail
);

router.post(
    '/',
    requireAuth,
    createCategory
);

router.put(
    '/:id',
    requireAuth,
    updateCategory
);

router.delete(
    '/:id',
    requireAuth,
    deleteCategory
);


module.exports = router;