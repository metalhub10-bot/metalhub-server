const IndustryCategory =
require(
    '../models/IndustryCategory'
);


// ======================================
// GET ALL CATEGORIES
// ======================================

const getCategories =
async (req, res) => {

    try {

        const categories =
        await IndustryCategory
            .find({
                isActive: true
            })
            .sort({
                order: 1,
                name: 1
            })
            .lean();

        return res.json({
            success: true,
            data: categories
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
// GET CATEGORY DETAIL
// ======================================

const getCategoryDetail =
async (req, res) => {

    try {

        const category =
        await IndustryCategory
            .findById(
                req.params.id
            );

        if (!category) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Category not found'
                });
        }

        return res.json({
            success: true,
            data:
                category
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
// CREATE CATEGORY
// ======================================

const createCategory =
async (req, res) => {

    try {

        const category =
        await IndustryCategory
            .create(
                req.body
            );

        return res
            .status(201)
            .json({
                success: true,
                message:
                    'Category created',
                data:
                    category
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
// UPDATE CATEGORY
// ======================================

const updateCategory =
async (req, res) => {

    try {

        const category =
        await IndustryCategory
            .findById(
                req.params.id
            );

        if (!category) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Category not found'
                });
        }

        Object.assign(
            category,
            req.body
        );

        await category.save();

        return res.json({
            success: true,
            message:
                'Category updated',
            data:
                category
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
// DELETE CATEGORY
// ======================================

const deleteCategory =
async (req, res) => {

    try {

        const category =
        await IndustryCategory
            .findById(
                req.params.id
            );

        if (!category) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Category not found'
                });
        }

        await category.deleteOne();

        return res.json({
            success: true,
            message:
                'Category deleted'
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
    getCategories,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory
};