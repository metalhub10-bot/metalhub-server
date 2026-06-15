const IndustryPublication = require('../models/IndustryPublication');
const IndustryProfile = require('../models/IndustryProfile');
const IndustryCategory = require('../models/IndustryCategory');


//-- Obtener todas las publicaciones --//
const getPublications = async (req, res) => {
    try {
        const { category, subCategory, city, province, offerType, search, page = 1, limit = 20 } = req.query;
        const filter = { status: 'approved', isActive: true };

        if (category) {
        	filter.category = category;
        }

        if (subCategory) {
            filter.subCategory = subCategory;
        }

        if (city) {
            filter['location.city'] = city;
        }

        if (province) {
            filter['location.province'] =
                province;
        }

        if (offerType) {
            filter.offerType =
                offerType;
        }

        if (search) {
            const regex =
                new RegExp(search, 'i');

            filter.$or = [
                { title: regex },
                { description: regex }
            ];
        }

        const skip = (page - 1) * limit;
        const publications = await IndustryPublication.find(filter).populate( 'category' ).populate( 'subCategory' ).sort({ createdAt: -1 }).skip(skip).limit(limit);

        return res.json({ success: true, data: publications });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

//-- Obtener mis publicaciones --//
const getMyPublications = async (req, res) => {
try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, parseInt(pagina, 10)) - 1) * Math.min(100, parseInt(limite, 10) || 20);
    const limit = Math.min(100, parseInt(limite, 10) || 20);
    const [items, total] = await Promise.all([
      Publicacion.find({ usuarioId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Publicacion.countDocuments({ usuarioId: req.userId }),
    ]);
    const user = await User.findById(req.userId).lean();
    const data = items.map((p) => {
      const pub = { ...p, id: p._id.toString(), creadoEn: p.createdAt };
      delete pub._id;
      delete pub.__v;
      delete pub.createdAt;
      delete pub.updatedAt;
      pub.usuario = user
        ? {
            id: user._id.toString(),
            nombre: user.nombre,
            rating: user.rating ?? 0,
            ubicacion: user.ubicacion,
            verificado: user.verificado ?? false,
            whatsapp: user.whatsapp,
            avatarUrl: user.avatarUrl,
          }
        : null;
      return pub;
    });
    return res.json({ success: true, data, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

//-- Obtener todas las publicaciones --//
const getPublicationDetail =
async (req, res) => {

    try {

        const publication =
        await IndustryPublication
            .findOne({
                slug:
                    req.params.slug,
                isActive: true,
                status: 'approved'
            })
            .populate(
                'category',
                'name slug'
            )
            .populate(
                'subCategory',
                'name slug'
            )
            .populate({
                path: 'owner',
                select: `
                    companyName
                    logo
                    verified
                    whatsapp
                    email
                    website
                    slug
                    averageRating
                `
            });

        if (!publication) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Publication not found'
                });
        }

        await IndustryPublication
            .findByIdAndUpdate(
                publication._id,
                {
                    $inc: {
                        views: 1
                    }
                }
            );

        return res.json({
            success: true,
            data: publication
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

//-- Obtener todas las publicaciones --//
const createPublication =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            });

        if (!profile) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        'Industry profile not found'
                });
        }

        const publication =
        await IndustryPublication
            .create({

            owner:
                profile._id,

            ...req.body
        });

        await IndustryProfile
            .findByIdAndUpdate(
                profile._id,
                {
                    $inc: {
                        publicationCount: 1
                    }
                }
            );

        return res
            .status(201)
            .json({
                success: true,
                message:
                    'Publication created',
                data:
                    publication
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

//-- Obtener todas las publicaciones --//
const updatePublication =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            });

        const publication =
        await IndustryPublication
            .findOne({
                _id:
                    req.params.id,
                owner:
                    profile._id
            });

        if (!publication) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Publication not found'
                });
        }

        Object.assign(
            publication,
            req.body
        );

        await publication.save();

        return res.json({
            success: true,
            message:
                'Publication updated',
            data:
                publication
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

//-- Obtener todas las publicaciones --//
const deletePublication =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            });

        const publication =
        await IndustryPublication
            .findOne({
                _id:
                    req.params.id,
                owner:
                    profile._id
            });

        if (!publication) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Publication not found'
                });
        }

        await publication.deleteOne();

        await IndustryProfile
            .findByIdAndUpdate(
                profile._id,
                {
                    $inc: {
                        publicationCount: -1
                    }
                }
            );

        return res.json({
            success: true,
            message:
                'Publication deleted'
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

//-- Obtener todas las publicaciones --//
const pausePublication =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            });

        const publication =
        await IndustryPublication
            .findOneAndUpdate(
                {
                    _id:
                        req.params.id,
                    owner:
                        profile._id
                },
                {
                    status:
                        'paused'
                },
                {
                    new: true
                }
            );

        if (!publication) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Publication not found'
                });
        }

        return res.json({
            success: true,
            message:
                'Publication paused',
            data:
                publication
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

//-- Obtener todas las publicaciones --//
const publishPublication =
async (req, res) => {

    try {

        const profile =
        await IndustryProfile
            .findOne({
                user:
                    req.userId
            });

        const publication =
        await IndustryPublication
            .findOneAndUpdate(
                {
                    _id:
                        req.params.id,
                    owner:
                        profile._id
                },
                {
                    status:
                        'approved'
                },
                {
                    new: true
                }
            );

        if (!publication) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                    'Publication not found'
                });
        }

        return res.json({
            success: true,
            message:
                'Publication published',
            data:
                publication
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
    getPublications,
    getMyPublications,
    getPublicationDetail,
    createPublication,
    updatePublication,
    deletePublication,
    pausePublication,
    publishPublication
}