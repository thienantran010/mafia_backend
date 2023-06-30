const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// configuration
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/*******************
* HELPER FUNCTIONS *
*******************/

// to send mail
const sendMail = async (email, verificationCode) => {
    const msg = {
        to: email, // Change to your recipient
        from: 'mafiawebappmailer@gmail.com', // Change to your verified sender
        subject: 'Verify your Mafia account',
        html: `Click <a href="${process.env.FRONTEND_URL}/verify/${verificationCode}"> here </a> to verify your account!`,
      }
    try {
        await sgMail.send(msg);
        console.log('Email sent');
    }
    catch (error) {
        console.log(error);
    }
}

// create access token
const createAccessToken = (payload) => {
    return jwt.sign({ ...payload }, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: 3 * 24 * 60 * 60,
    });
};

// create refresh token
const createRefreshToken = (payload) => {
    return jwt.sign({ ...payload }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: 3 * 24 * 60 * 60,
    });
};


// find user by email
/*
const findByEmail = async (email) => {
    const resultsArray = await userRepository.search().where('email').eq(email).return.all();
    if (resultsArray.length === 0) {
        return null;
    }
    else {
        return resultsArray[0];
    }
}
*/

/*******************
*** CONTROLLERS ****
*******************/

//refresh controller
exports.refresh = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(401).json({message: 'Unauthorized'});
    const refreshToken = cookies.refreshToken;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' });
            const userExists = await User.findById(decoded.id).exec();
            if (!userExists) return res.status(401).json({message: 'Unauthorized'});
            const accessToken = createAccessToken({ id: decoded.id });
            const username = userExists.username;
            res.json({ accessToken, username });
        }
    )
};

// login controller
exports.login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({message:'All fields are required'}) // general client error
    }
    try {
        const existingUser = await User.findOne({email: email});
        if (!existingUser) {
            return res.status(400).json({ message: "Email or password is wrong" }); // general client error
        }
        const auth = await bcrypt.compare(password, existingUser.hashedPassword);
        if (!auth) {
            return res.status(400).json({message: "Email or password is wrong"}); // general client error
        }
        const username = existingUser.username;
        const payload = {id: existingUser._id};
        const accessToken = createAccessToken(payload); 
        const refreshToken = createRefreshToken(payload);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken, username });
    }
    catch (error) {
        console.log(error);
    }
};

// logout controller
exports.logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(204).json({message: "No refresh token to clear"});
    res.clearCookie(
        'refreshToken',
        {
            httpOnly: true,
            sameSite: 'None',
            secure: true
        }
    )
    res.json({ message: 'Logged out' });
};

// register controller
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({message: "All fields are required."}); // general client error
        }

        const userExists = await User.findOne({email: email}).exec();

        if (userExists) {
            return res.status(409).json({ message: "User already exists" }); // conflict
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        let user = {
            username: username,
            email: email,
            hashedPassword: hashedPassword,
            isVerified: false, 
        }

        let userRecord = new User(user);
        userRecord = await userRecord.save();
        let recordId = userRecord._id;
        sendMail(email, recordId);
        return res.json({ message: "Check email to confirm your account." });
    }
    catch (error) {
        res.send(error);
    }
};

// verify email controller
exports.verifyEmail = async (req, res) => {
    try {
        const { recordId } = req.params;
        const existingUser = await User.findById(recordId).exec();
        console.log(existingUser);
        if (existingUser) {
            if (existingUser.isVerified === false) {
                existingUser.isVerified = true;
                await existingUser.save();
                return res.json({message: 'Your account has been verified! Please return to login page.'});
            }
            return res.json({message: 'Your account has already been verified. Please return to the login page.'});
        }
        else {
            return res.status(404).json({message: 'this verification code is not tied to any user'}); //not found
        }
    }
    catch (error) {
        console.log(error);
    }
};