const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        // Save where they were trying to go
        req.session.loginRedirect = req.originalUrl;
        return res.redirect('/auth/login');
    }
    next();
};

const requireLeader = (req, res, next) => {
    if (!req.session.user) {
        // Remember where they were trying to go
        req.session.loginRedirect = req.originalUrl;
        return res.redirect('/auth/login');
    }

    if (req.session.user.role !== 'leader' && req.session.user.role !== 'admin') {
        return res.status(403).render('403', {
            title: 'Access denied',
            user: req.session.user
        });
    }

    next();
};

module.exports = { requireLeader };
