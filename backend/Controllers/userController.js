import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

export const updateUser = async(req, res) => {
    const id = req.params.id;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            {$set:req.body}, 
            {new:true}
        );
        res.status(200).json({
            success:true, 
            message: "User updated successfully", 
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success:false, 
            message: "User update failed"
        });
    }
};

export const deleteUser = async(req, res) => {
    const id = req.params.id;

    try {
        await User.findByIdAndDelete(
            id
        );
        res.status(200).json({
            success:true, 
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success:false, 
            message: "User deletion failed"
        });
    }
};

export const getUser = async(req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(id)
            .select("-password");
        res.status(200).json({
            success:true, 
            message: "User found", 
            data: user
        });
    } catch (error) {
        res.status(404).json({
            success:false, 
            message: "User not found"
        });
    }
};

export const getAllUsers = async(req, res) => {
    try {
        const users = await User.find({})
            .select("-password");
        res.status(200).json({
            success:true, 
            message: "Users found", 
            data: users
        });
    } catch (error) {
        res.status(404).json({
            success:false, 
            message: "No users found in the database"
        });
    }
};

export const getUserProfile = async(req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        } 

        const{password, ...rest} = user._doc;

        res.status(200).json({
            success: true,
            message: "Profile info is getting",
            data: {...rest}
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong with user profile."
        });
    }
};

export const getMyAppointments = async(req, res) => {
    try {
        //step 1: retrieve appointments from booking for specific user
        const bookings = await Booking.find({ user: req.userId });
        //step 2: extract doctorIds from appointments
        const doctorIds = bookings.map(el => el.doctor.id);
        //step 3: retrieve doctors using extracted doctorIds
        const doctors = await Doctor.find({ _id: 
        {
            $in: doctorIds
        }}).select("-password");

        res.status(200).json({
            success: true,
            message: "Appointments found",
            data: doctors,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong with appointments."
        });
    }
};