const IndustryProfile =
require('../models/IndustryProfile');


// ======================================
// GET ALL PROFILES
// ======================================

const getProfiles =
async (req, res) => {

    try {

        const {
            category,
            city,
            province,
            verified,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const filter = {
            isActive: true
        };

        if (category) {
            filter.categories =
                category;
        }

        if (city) {
            filter['location.city'] =
                city;
        }

        if (province) {
            filter[
                'location.province'
            ] = province;
        }

        if (
            verified === 'true'
        ) {
            filter.verified =
                true;
        }

        if (search) {

            const regex =
            new RegExp(
                search,
                'i'
            );

            filter.$or = [
                {
                    companyName:
                        regex
                },
                {
                    description:
                        regex
                }
            ];
        }

        const parsedPage =
            Math.max(
                1,
                Number(page)
            );

        const parsedLimit =
            Math.min(
                100,
                Number(limit)
            );

        const skip =
            (parsedPage - 1)
            * parsedLimit;

        const [items, total] =
        await Promise.all([

            IndustryProfile
                .find(filter)
                .populate(
                    'categories',
                    'name slug'
                )
                .sort({
                    verified: -1,
                    averageRating: -1
                })
                .skip(skip)
                .limit(parsedLimit)
                .lean(),

            IndustryProfile
                .countDocuments(
                    filter
                )

        ]);

        return res.json({
            success: true,
            total,
            page: parsedPage,
            limit: parsedLimit,
            data: items
        });

    } catch (err) {

        return res
            .status(500)
            .json({
                success: false,
                message:
                    err.message
            });
    }
};


// ======================================
// GET PROFILE DETAIL
// ======================================

const getProfileDetail =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                slug:
                    req.params.slug,
                isActive:
                    true
            })
            .populate(
                'categories',
                'name slug'
            );

        if (!profile) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Profile not found'
                });
        }

        return res.json({
            success: true,
            data: profile
        });

    } catch (err) {

        return res
            .status(500)
            .json({
                success: false,
                message:
                    err.message
            });
    }
};


// ======================================
// GET MY PROFILE
// ======================================

const getMyProfile =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            })
            .populate(
                'categories',
                'name slug'
            );

        if (!profile) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Profile not found'
                });
        }

        return res.json({
            success: true,
            data: profile
        });

    } catch (err) {

        return res
            .status(500)
            .json({
                success: false,
                message:
                    err.message
            });
    }
};


// ======================================
// CREATE PROFILE
// ======================================

const createProfile =
async (req, res) => {

    try {

        const exists =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            });

        if (exists) {
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                    'Profile already exists'
                });
        }

        const profile =
        await IndustryProfile
            .create({
                user:
                    req.userId,

                ...req.body
            });

        return res
            .status(201)
            .json({
                success: true,
                message:
                    'Profile created',
                data:
                    profile
            });

    } catch (err) {

        return res
            .status(500)
            .json({
                success: false,
                message:
                    err.message
            });
    }
};


// ======================================
// UPDATE PROFILE
// ======================================

const updateProfile =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                _id:
                    req.params.id,
                user:
                    req.userId
            });

        if (!profile) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Profile not found'
                });
        }

        Object.assign(
            profile,
            req.body
        );

        await profile.save();

        return res.json({
            success: true,
            message:
                'Profile updated',
            data:
                profile
        });

    } catch (err) {

        return res
            .status(500)
            .json({
                success: false,
                message:
                    err.message
            });
    }
};


// ======================================
// DELETE PROFILE
// ======================================

const deleteProfile =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                _id:
                    req.params.id,
                user:
                    req.userId
            });

        if (!profile) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Profile not found'
                });
        }

        await profile.deleteOne();

        return res.json({
            success: true,
            message:
                'Profile deleted'
        });

    } catch (err) {

        return res
            .status(500)
            .json({
                success: false,
                message:
                    err.message
            });
    }
};


module.exports = {
    getProfiles,
    getProfileDetail,
    getMyProfile,
    createProfile,
    updateProfile,
    deleteProfile
};