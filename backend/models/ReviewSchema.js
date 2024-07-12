import mongoose from "mongoose";
import Doctor from "./DoctorSchema.js";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) { //pre(find) executes query below before any query string before prefix find
  this.populate({ //middleware function is used to populate user information for reviews, executed each time a query for reviews is made
    path: "user",
    select: "name photo"
  });
  
  next();
});

reviewSchema.statics.calcAverateRatings = async function(doctorId) {
  //this points to the current review
  const stats = await this.aggregate([
  {
    $match: { doctor: doctorId },
  },
  {
    $group: {
      _id: '$doctor',
      numOfRating: { $sum: 1 },
      avgRating: { $avg: "$rating" }
    }
  }
]);

  await Doctor.findByIdAndUpdate(doctorId, {
    totalRating: stats[0].numOfRating,
    averageRating: stats[0].averageRating,
  });
}

reviewSchema.post('save', function() {
  this.constructor.calcAverateRatings(this.doctor);
});

export default mongoose.model("Review", reviewSchema);