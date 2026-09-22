require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser'); // optional; express has built-ins too
const session = require('express-session');
const passport = require('./utilities/passport');
const mongodb = require('./data/database');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Global template locals (available in every EJS view)
app.locals.title = process.env.SITE_TITLE || "Moroni’s Quest";
app.locals.description = process.env.SITE_DESC || "Moroni’s Quest — Sherwood Park Stake";
app.locals.stake = process.env.STAKE_NAME || "Sherwood Park Stake";
app.locals.campStartISO = process.env.CAMP_START_ISO || "2026-07-07T00:00:00-06:00";

app.use(cors({
    origin: process.env.CLIENT_URL, // if you need multiple origins, use a function here
    credentials: true,
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Trust proxy for secure cookies behind a proxy (Render, etc.)
app.set('trust proxy', 1);

// Security headers (allow Google Fonts for our splash styles)
app.use(helmet({
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "img-src": ["'self'", "data:", "https://i.ytimg.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "script-src": ["'self'"],

            // allow YouTube embeds
            "frame-src": [
                "'self'",
                "https://www.google.com",
                "https://maps.google.com",
                "https://www.youtube.com",
                "https://www.youtube-nocookie.com"
            ],

            // keep mirrored (some browsers still reference this)
            "child-src": [
                "'self'",
                "https://www.google.com",
                "https://maps.google.com",
                "https://www.youtube.com",
                "https://www.youtube-nocookie.com"
            ],
        }
    }
}));



// EJS view engine + static assets
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'moronis-quest-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

app.use(require('./routes/swagger'));  // exposes /api-docs

// routes. Authentication first
app.use('/auth', require('./routes/auth'));

app.use('/', require('./routes'));

// Catch all Error (consider an Express error handler too)
process.on('uncaughtException', (err, origin) => {
    console.log(process.stderr.fd, `Exception occurred: ${err}\n` + `Exception occurred at ${origin}`);
});

if (require.main === module) {
    mongodb.initDB((err) => {
        if (err) {
            console.log(err);
        } else {
            app.listen(port, () => console.log(`Moroni's Quest running on port ${port}`));
        }
    });
}

//sheets debug
//const { debugSheetsAccess } = require("./services/googleSheets");
//debugSheetsAccess().catch(err => {
//    console.error("Sheets debug failed:", err?.message || err);
//});

module.exports = app;
