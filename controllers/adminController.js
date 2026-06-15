const User = require('../models/User');
const Publicacion = require('../models/Publicacion');

exports.getStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [
      users,
      publicaciones,
      ofertasActivas,

      usersToday,
      usersThisWeek,
      usersThisMonth,

      publicacionesToday,
      publicacionesThisWeek,
      publicacionesThisMonth,

      ofertasActivasToday,
      ofertasActivasThisWeek,
      ofertasActivasThisMonth,
    ] = await Promise.all([

      // Totales
      User.countDocuments(),
      Publicacion.countDocuments(),
      Publicacion.countDocuments({
        cerrada: false,
      }),

      // Usuarios
      User.countDocuments({
        createdAt: { $gte: startOfToday },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfWeek },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),

      // Publicaciones
      Publicacion.countDocuments({
        createdAt: { $gte: startOfToday },
      }),
      Publicacion.countDocuments({
        createdAt: { $gte: startOfWeek },
      }),
      Publicacion.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),

      // Ofertas activas creadas en esos períodos
      Publicacion.countDocuments({
        cerrada: false,
        createdAt: { $gte: startOfToday },
      }),
      Publicacion.countDocuments({
        cerrada: false,
        createdAt: { $gte: startOfWeek },
      }),
      Publicacion.countDocuments({
        cerrada: false,
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        users: {
          total: users,
          today: usersToday,
          thisWeek: usersThisWeek,
          thisMonth: usersThisMonth,
        },

        publicaciones: {
          total: publicaciones,
          today: publicacionesToday,
          thisWeek: publicacionesThisWeek,
          thisMonth: publicacionesThisMonth,
        },

        ofertasActivas: {
          total: ofertasActivas,
          today: ofertasActivasToday,
          thisWeek: ofertasActivasThisWeek,
          thisMonth: ofertasActivasThisMonth,
        },

        reportes: {
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
        },
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};