
module.exports.isloggedin = (req, res, next) => {
    
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // inbuilt
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
