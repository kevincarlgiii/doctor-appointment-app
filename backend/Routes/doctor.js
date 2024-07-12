import express from 'express';
import { updateDoctor, deleteDoctor, getDoctor, getAllDoctors, getDoctorProfile} from "../Controllers/doctorController.js";
import { authenticate, restrict } from '../auth/verifyToken.js';
import reviewRouter from './review.js';

const router = express.Router();

//nested route for doctor reviews via the review router
router.use('/:doctorId/reviews', reviewRouter);

router.get('/:id', getDoctor);
router.get('/', getAllDoctors);
router.put('/:id', authenticate, restrict(["doctor"]),  updateDoctor);
router.delete('/:id', authenticate, restrict(["doctor"]),  deleteDoctor);
router.get('/profile/me', authenticate, restrict(["doctor"]), getDoctorProfile);

export default router;