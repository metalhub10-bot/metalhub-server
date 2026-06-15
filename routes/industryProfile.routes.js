const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {getProfiles,
    getProfileDetail,
    getMyProfile,
    createProfile,
    updateProfile,
    deleteProfile
} = require('../controllers/industryProfile.controller');


router.get(
    '/',
    getProfiles
);

router.get(
    '/my-profile',
    requireAuth,
    getMyProfile
);

router.get(
    '/:slug',
    getProfileDetail
);

router.post(
    '/',
    requireAuth,
    createProfile
);

router.put(
    '/:id',
    requireAuth,
    updateProfile
);

router.delete(
    '/:id',
    requireAuth,
    deleteProfile
);


module.exports = router;