// ===================== IMPORTS =====================
const uploadbuffer = require("../src/service/storage");
const express = require("express");
const { usermodel, postmodel } = require("../db/model");
const multer = require("multer");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ⭐ Razorpay Route Import
const paymentRoutes = require("./routes/payment");

// ===================== SETUP =====================
const upload = multer({ storage: multer.memoryStorage() });
const app = express();


// ✅ FIXED CORS (ALLOW 5173 + 5174)
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: "your-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false
    }
}));

app.use(passport.initialize());
app.use(passport.session());


// ===================== GOOGLE AUTH =====================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await usermodel.findOne({ googleId: profile.id });

        if (!user) {
            user = await usermodel.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0]?.value,
                isNewUser: true
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usermodel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/acc" }),
    (req, res) => {
        const redirectUrl = req.user.isNewUser
            ? "http://localhost:5173/newacc"
            : "http://localhost:5173/acc/home";
        res.redirect(redirectUrl);
    }
);

app.get("/auth/user", (req, res) => {
    if (req.isAuthenticated())
        res.json({ success: true, user: req.user });
    else
        res.json({ success: false, message: "Not authenticated" });
});

app.post("/auth/logout", (req, res) => {
    req.logout(err => {
        if (err)
            return res.json({ success: false, message: "Logout failed" });
        res.json({ success: true, message: "Logged out successfully" });
    });
});


// ===================== FILE UPLOAD =====================
app.post("/api/upload/avatar", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated())
        return res.status(401).json({ success: false, message: "Not authenticated" });

    try {
        if (!req.file)
            return res.status(400).json({ success: false, message: "No file uploaded" });

        const result = await uploadbuffer(req.file.buffer);
        res.json({ success: true, avatar: result.url, fileId: result.fileId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


// ===================== PROFILE =====================
app.put("/api/user/complete-profile", async (req, res) => {
    if (!req.isAuthenticated())
        return res.status(401).json({ success: false, message: "Not authenticated" });

    try {
        const { username, mobile, name, avatar, password } = req.body;

        const existingUser = await usermodel.findOne({ username });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString())
            return res.status(400).json({ success: false, message: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await usermodel.findByIdAndUpdate(
            req.user._id,
            { username, mob: mobile, name, avatar, password: hashedPassword, isNewUser: false },
            { new: true }
        );

        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


// ===================== POSTS =====================
app.post("/post/create",
    upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]),
    async (req, res) => {
        try {
            const { id, userId, likes, featured } = req.body;
            const userExists = await usermodel.findOne({ id: userId });

            if (!userExists)
                return res.status(404).json({ success: false, message: "User not found" });

            let imageUrl = null;
            let videoUrl = null;

            if (req.files?.image)
                imageUrl = (await uploadbuffer(req.files.image[0].buffer)).url;

            if (req.files?.video)
                videoUrl = (await uploadbuffer(req.files.video[0].buffer)).url;

            const newPost = await postmodel.create({
                id,
                image: imageUrl,
                Video: videoUrl,
                likes,
                featured
            });

            res.status(201).json({ success: true, data: newPost });

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
);

app.get("/post/view", async (req, res) => {
    try {
        const posts = await postmodel.find();
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// ===================== ⭐ RAZORPAY ROUTE =====================
app.use("/payment", paymentRoutes);

// Test route
app.get("/", (req, res) => res.send("Server Running..."));

module.exports = app;
