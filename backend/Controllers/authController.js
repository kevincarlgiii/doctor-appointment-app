import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const generateToken = user => {
    return jwt.sign({ 
        id: user._id, 
        role: user.role 
    }, 
    process.env.JWT_SECRET_KEY, {
        expiresIn: "1d"
    }); 
    //crypto.randomBytes(256).toString('base64') does not work for some reason so I created my own JWT key
}

export const register = async (req, res) => {
    const { email, password, name, role, photo, gender } = req.body;

    try {
        let user = null;
        if (role === 'patient') {
            user = await User.findOne({ email });
        } else if (role === 'doctor') {
            user = await Doctor.findOne({ email });
        }

        //check if user exists
        if (user) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        //create a new user based on roles
        if (role === 'patient') {
            user = new User({
                name, email, 
                password:hashPassword, 
                photo, 
                gender, 
                role
            });
        }

        if (role === 'doctor') {
            user = new Doctor({
                name, 
                email, 
                password:hashPassword, 
                photo, 
                gender, 
                role
            });
        }

        //save user data with corresponding response
        await user.save();
        res.status(200).json({ 
            success: true, 
            message: "User successfully created" 
        });

    } catch(error) { //error saving user data
        res.status(500).json({ 
            success: false, 
            message: "Internal server error, try again." 
        });
    }
};

export const login = async (req, res) => {
    const { email } = req.body;
    
    try {
        let user = null;
        const patient = await User.findOne({ email }) //assign user as a patient
        const doctor = await Doctor.findOne({ email }) //assign user as a doctor

        if (patient) { //checks if user is patient
            user = patient;
        }

        if (doctor) { //checks if user is doctor
            user = doctor;
        }

        //checks if user exists or not
        if (!user) {
            res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        //compare password to db
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        //generate auth token using jwt
        const token = generateToken(user);

        const { password, role, appointments, ...rest } = user._doc;

        res.status(200).json({ 
            success: true, 
            message: "Logged in successfully.", 
            token, 
            data: {...rest}, 
            role 
        });

    } catch(error) {
        res.status(500).json({ 
            success: false, 
            message: "Log in failed"
        });
    }
};