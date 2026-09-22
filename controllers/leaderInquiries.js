const inquiriesService = require('../services/inquiriesService')

const rankStatus = (s) => {
    const status = (s || 'new').toLowerCase();
    if (status === 'new') return 0;
    if (status === 'responded') return 1;
    if (status === 'closed') return 2;
    return 9;
};

const renderListPage = async (req, res) => {
    try {
        const selectedStatus = (req.query.status || 'all').toLowerCase();
        const inquiries = await inquiriesService.list({ status: selectedStatus });
        //console.log('STATUS QUERY:', req.query.status);

        inquiries.sort((a, b) => {
            const r = rankStatus(a.status) - rankStatus(b.status);
            if (r !== 0) return r;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        res.render('leaders/inquiries', {
            inquiries,
            selectedStatus,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error(err);
        res.render('leaders/inquiries', {
            inquiries: [],
            selectedStatus: (req.query.status || 'all').toLowerCase(),
            success: null,
            error: 'Could not load inquiries.'
        });
    }
};

const advanceStatus = async (req, res) => {
    try {
        const inquiry = await inquiriesService.getById(req.params.id);
        if (!inquiry) return res.redirect('/leaders/inquiries?error=Inquiry%20not%20found');

        const current = (inquiry.status || 'new').toLowerCase();
        const next =
            current === 'new' ? 'responded' :
                current === 'responded' ? 'closed' :
                    'closed';

        await inquiriesService.setStatus(req.params.id, next);
        return res.redirect('/leaders/inquiries?success=Status%20updated');
    } catch (err) {
        console.error(err);
        return res.redirect('/leaders/inquiries?error=Could%20not%20update');
    }
};

module.exports = { renderListPage, advanceStatus };
