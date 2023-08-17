const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB Atlas connection URL
const mongoURI = 'mongodb+srv://financekannada44:Q!1werty@cluster0.f2gitkn.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Define a schema for the registration data
const registrationSchema = new mongoose.Schema(
  {
    nameInput: String,
    dobInput: Date,
    sexInput: String,
    emailInput: {
      type: String,
      unique: true,
    },
    phoneInput: String,
    houseInput: String,
    streetInput: String,
    areaInput: String,
    cityInput: String,
    stateInput: String,
    landmarkInput: String,
    usernameInput: String,
    passwordInput: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
  },
  { timestamps: true }
);

// Create a model based on the schema
const Registration = mongoose.model('Registration', registrationSchema);

// Configure nodemailer with your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  host: 'smtp.gmail.com',
  auth: {
    user: 'financekannada44@gmail.com',
    pass: 'pwfzmlcmmxxvzwep',
  },
});

// Generate a verification token
const generateVerificationToken = (email) => {
  const secret = '<your-secret-key>';
  const token = jwt.sign({ email }, secret, { expiresIn: '3h' });
  return token;
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;

  const mailOptions = {
    from: 'financekannada44@gmail.com',
    to: email,
    subject: 'Email Verification',
text: `Please click the following link to verify your email: ${verificationLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Route for registering a new user
app.post('/register', async (req, res) => {
  const {
    nameInput,
    dobInput,
    sexInput,
    emailInput,
    phoneInput,
    houseInput,
    streetInput,
    areaInput,
    cityInput,
    stateInput,
    landmarkInput,
    usernameInput,
    passwordInput,
  } = req.body;

  try {
    // Check if email already exists
    const existingRegistration = await Registration.findOne({ emailInput });

    if (existingRegistration) {
      // Email already registered
      console.error('Email already registered:', emailInput);
      const errorMessage = 'Email already registered.';
      res.send(`<script>alert("${errorMessage}"); window.location.href = "/Registeration_page.html";</script>`);
    } else {
      // Generate a verification token
      const verificationToken = generateVerificationToken(emailInput);

      // Create a new registration instance
      const registration = new Registration({
        nameInput,
        dobInput,
        sexInput,
        emailInput,
        phoneInput,
        houseInput,
        streetInput,
        areaInput,
        cityInput,
        stateInput,
        landmarkInput,
        usernameInput,
        passwordInput,
        verificationToken,
      });

      // Save the registration data to the database
      await registration.save();

      // Send the verification email
      await sendVerificationEmail(emailInput, verificationToken);

    const successMessage = 'Verification email sent. Please verify your account.';
    res.send(`<script>alert("${successMessage}"); window.location.href = "/index.html";</script>`);
    }
  } catch (error) {
    console.error('Error registering user:', error);
    // res.status(500).json({ error: 'An error occurred while registering user.' });
    res.send(`<script>alert("An error occurred while registering user."); window.location.href = "/index.html";</script>`);
  }
});


// Route for verifying user email
app.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const secret = '<your-secret-key>';
    const decoded = jwt.verify(token, secret);

    // Find the registration record with the given email
    const registration = await Registration.findOne({ emailInput: decoded.email });

    if (registration) {
      // Update the registration record as verified
      registration.isVerified = true;
      registration.verificationToken = undefined;
      await registration.save();

      // res.status(200).json({ message: 'Email verification successful. You can now log in.' });
      const successMessage = 'Email verified.';
      res.send(`<script>alert("${successMessage}"); window.location.href = "/in_home.html";</script>`);
    } else {
      // res.status(404).json({ error: 'Registration not found.' });
      res.send(`<script>alert("Registeration not found"); window.location.href = "/index.html";</script>`);
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    // res.status(500).json({ error: 'An error occurred while verifying email.' });
    res.send(`<script>alert("An error occurred while verifying email."); window.location.href = "/index.html";</script>`);
  }
});

// Delete unverified data after 3 hours
setInterval(async () => {
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

  try {
    // Delete unverified records created before 3 hours ago
    await Registration.deleteMany({ isVerified: false, createdAt: { $lt: threeHoursAgo } });
    console.log('Unverified data deleted successfully.');
  } catch (error) {
    console.error('Error deleting unverified data:', error);
  }
}, 3 * 60 * 60 * 1000); // Run every 3 hours

passport = require("passport"),
bodyParser = require("body-parser"),
LocalStrategy = require("passport-local"),
passportLocalMongoose = 
        require("passport-local-mongoose")
const User = require("./model/User");

  
mongoose.connect("mongodb+srv://financekannada44:Q!1werty@cluster0.f2gitkn.mongodb.net/?retryWrites=true&w=majority");
  
app.set("views", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
  
app.use(passport.initialize());
app.use(passport.session());
  
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
  
//=====================
// ROUTES
//=====================
  
// Showing home page
app.get("/", function (req, res) {
    res.render("home");
});
  
// Showing secret page
app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
});
  
// Showing register form
app.get("/register", function (req, res) {
    res.render("register");
});
  
// Handling user signup
app.post("/register", async (req, res) => {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password
    });
    
    return res.status(200).json(user);
  });
  
//Showing login form
app.get("/login", function (req, res) {
    res.render("login");
});
  
//Handling user login
app.post("/login", async function(req, res){
    try {
        // check if the user exists
        const user = await User.findOne({ username: req.body.username});
        if (user) {
          //check if password matches
          const result = req.body.password   === user.password;
          if (result) {
            res.render("secret");
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        } else {
          res.status(400).json({ error: "User doesn't exist" });
        }
      } catch (error) {
        res.status(400).json({ error });
        console.log("Error");
      }
});

  
//Handling user logout 
app.get("/logout", function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
  
  
  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
//test

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
