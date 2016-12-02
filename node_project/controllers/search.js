/**
 * GET /contact
 * Contact form page.
 */
exports.getSearch = (req, res) => {
    res.render('search', {
        title: 'Search'
    });
};
