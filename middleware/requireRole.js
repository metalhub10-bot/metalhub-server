const User =
require('../models/User');

const Session =
require('../models/Session');

const requireRole = (...allowedRoles) => {

    return async (req, res, next) => {

        try {
            const sessionId = req.headers['x-session-id'];

            if (!sessionId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            const session = await Session.findOne({ sessionId });

            if (!session) {
                return res.status(401).json({ success: false, message: 'Invalid session' });
            }

            const user = await User.findById(session.userId).select( '_id rol' );

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            if (!allowedRoles.includes(user.rol)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            req.userId = user._id;
            req.userRole = user.rol;
            next();

        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    };
};

module.exports = requireRole;