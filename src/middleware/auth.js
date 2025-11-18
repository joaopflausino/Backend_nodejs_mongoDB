const authMiddleware = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({
            success: false,
            error: 'Autenticação necessária. Faça login para acessar este recurso.'
        });
    }
};

const optionalAuth = (req, res, next) => {
    next();
};

const checkResourceOwnership = (getUserIdFromRequest) => {
    return (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                error: 'Autenticação necessária'
            });
        }

        const resourceUserId = getUserIdFromRequest(req);

        if (req.session.userId !== resourceUserId) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para acessar este recurso'
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    optionalAuth,
    checkResourceOwnership
};
