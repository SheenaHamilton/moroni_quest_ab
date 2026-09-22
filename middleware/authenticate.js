const isAuthenticated = (req, res, next) => {
    if (req.session.user === undefined) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.session.user === undefined) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
    }
    next();
};

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        // Optional: remember where they were trying to go
        return res.redirect(`/auth/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
    next();
};

const isLeader = (req, res, next) => {
    if (req.session.user === undefined) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
    }

    // allow leader OR admin
    if (req.session.user.role !== 'leader' && req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Leaders only.' });
    }

    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    requireLogin,
    isLeader
};