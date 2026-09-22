const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongodb = require('../data/database');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const db = mongodb.getDatabase().db();
                const usersCollection = db.collection('users');

                // Check if user already exists
                let user = await usersCollection.findOne({ googleId: profile.id });

                if (!user) {
                    // Create new user
                    const newUser = {
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        displayName: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        profilePhoto: profile.photos[0]?.value,
                        role: 'user', // Default role
                        createdAt: new Date(),
                        lastLogin: new Date(),
                    };

                    const result = await usersCollection.insertOne(newUser);
                    user = { _id: result.insertedId, ...newUser };
                } else {
                    // Update last login
                    await usersCollection.updateOne(
                        { googleId: profile.id },
                        { $set: { lastLogin: new Date() } }
                    );
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const ObjectId = require('mongodb').ObjectId;
        const db = mongodb.getDatabase().db();
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;