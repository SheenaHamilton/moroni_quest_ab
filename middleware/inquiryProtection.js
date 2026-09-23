const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const MIN_FORM_TIME_MS = 2500;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;

const issueChallenge = (req) => {
    const first = Math.floor(Math.random() * 7) + 2;
    const second = Math.floor(Math.random() * 7) + 2;

    req.session.inquiryChallenge = {
        answer: first + second,
        issuedAt: Date.now(),
    };

    return `${first} + ${second}`;
};

const rateLimit = (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const recent = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);

    recent.push(now);
    attempts.set(key, recent);

    if (recent.length > MAX_ATTEMPTS) {
        req.inquiryProtectionError = 'Too many messages were submitted. Please wait 15 minutes and try again.';
    }

    // Keep the small in-memory store from retaining inactive addresses.
    if (attempts.size > 500) {
        for (const [address, timestamps] of attempts) {
            if (!timestamps.some((time) => now - time < WINDOW_MS)) attempts.delete(address);
        }
    }

    next();
};

const verify = (req, res, next) => {
    // Bots commonly fill every field. Return a normal success response so they
    // do not learn which field rejected the submission.
    if (String(req.body.website || '').trim()) {
        return res.redirect('/inquiries?success=1');
    }

    const challenge = req.session.inquiryChallenge;
    const submittedAnswer = Number.parseInt(req.body.verification, 10);
    const elapsed = challenge ? Date.now() - challenge.issuedAt : 0;

    if (!req.inquiryProtectionError && (
        !challenge ||
        !Number.isInteger(submittedAnswer) ||
        submittedAnswer !== challenge.answer ||
        elapsed < MIN_FORM_TIME_MS ||
        elapsed > MAX_FORM_AGE_MS
    )) {
        req.inquiryProtectionError = 'Please complete the verification question and try again.';
    }

    req.inquiryChallengeQuestion = issueChallenge(req);
    next();
};

module.exports = { issueChallenge, rateLimit, verify };
