const uploadbuffer = require("../src/service/storage");
const express = require("express");
const { usermodel, postmodel } = require("../db/model");
const multer = require("multer");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require('bcryptjs');
require("dotenv").config();

const upload=multer({storage:multer.memoryStorage()})

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: 'your-secret-key-change-this-in-production',
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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
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

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usermodel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

app.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/acc' }),
    (req, res) => {
        const redirectUrl = req.user.isNewUser 
            ? 'http://localhost:5173/newacc' 
            : 'http://localhost:5173/acc/home';
        res.redirect(redirectUrl);
    }
);

app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: req.user
        });
    } else {
        res.json({
            success: false,
            message: 'Not authenticated'
        });
    }
});

app.post('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.post('/api/upload/avatar', upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }

        const result=await uploadbuffer(req.file.buffer)

        res.json({ 
            success: true, 
            avatar: result.url,
            fileId: result.fileId
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});


app.put('/api/user/complete-profile', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        const { username, mobile, name, avatar, password } = req.body;

        const existingUser = await usermodel.findOne({ username });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already taken' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await usermodel.findByIdAndUpdate(
            req.user._id,
            { 
                username, 
                mob: mobile, 
                name,
                avatar,
                password: hashedPassword,
                isNewUser: false 
            },
            { new: true }
        );

        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

app.post("/user/create", async (req, res) => {
    try {
        const { id, name, email, username, password, mob, followers, Following, alltime_rank, monthly_rank, weekly_rank, featured, verified } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await usermodel.create({
            id,
            name,
            email,
            username,
            password: hashedPassword,
            mob,
            followers,
            Following,
            alltime_rank,
            monthly_rank,
            weekly_rank,
            featured,
            verified,
            isNewUser: false
        });
        
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
});

app.post("/post/create", upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }]), async (req, res) => {
    try {
        const { id, userId, likes, featured } = req.body;
        
        const userExists = await usermodel.findOne({ id: userId });
        
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let imageUrl = null;
        let videoUrl = null;

        if (req.files?.image) {
            const imageResult = await uploadbuffer(req.files.image[0].buffer, `post_${Date.now()}_image.jpg`);
            imageUrl = imageResult.url;
        }

        if (req.files?.video) {
            const videoResult = await uploadbuffer(req.files.video[0].buffer, `post_${Date.now()}_video.mp4`);
            videoUrl = videoResult.url;
        }
        
        const newPost = await postmodel.create({
            id,
            image: imageUrl,
            Video: videoUrl,
            likes,
            featured
        });
        
        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: newPost,
            user: userId
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating post",
            error: error.message
        });
    }
});

app.get("/post/view", async (req, res) => {
    try {
        const posts = await postmodel.find();
        res.status(200).json({
            success: true,
            posts: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching posts",
            error: error.message
        });
    }
});
const paymentRoutes = require("./routes/payment");

app.use("/payment", paymentRoutes);

module.exports = app;