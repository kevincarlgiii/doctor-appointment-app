import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

export const authenticate = async(req, res, next) => {
    //get token from headers
    const authToken = req.headers.authorization;

    //check if token exists
    if(!authToken || !authToken.startsWith('Bearer')) {
        return res.status(401).json({ 
            success: false, 
            message: "No token, Authorization denied" 
        });
    }

    try {
        const token = authToken.split(" ")[1];

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        req.userId = decoded.id;
        req.role = decoded.role;

        next(); //always call next function, otherwise, it will not work
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ 
                success: false, 
                message: "Token is expired" 
            });
        }

        return res.status(401).json({
            success: false, 
            message: "Invalid token. Try to refresh browser."
        });
    }
};

export const restrict = roles => async(req, res, next) => {
    const userId = req.userId;

    let user;

    const patient = await User.findById(userId);
    const doctor = await Doctor.findById(userId);

    if (patient) {
        user = patient;
    }

    if (doctor) {
        user = doctor;
    }

    if (!roles.includes(user.role)) {
        return res.status(401).json({
            success: false,
            message: "You are not authorized"
        });
    }

    next();
}