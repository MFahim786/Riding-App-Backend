// controllers/vehicleController.js
import Vehicle from './model.js';
import { sendSuccessResponse, sendErrorResponse, HTTP_STATUS } from '../utils/responseUtils.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const { OK, CREATED, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = HTTP_STATUS;

class VehicleController {
    async createVehicle(req, res) {

        let vehicleImageLocalPath;
        if (req.files && Array.isArray(req.files.vehicleImg) && req.files.vehicleImg.length > 0) {
            coverImageLocalPath = req.files.vehicleImg[0].path
        }

        const vehicleImage = await uploadOnCloudinary(vehicleImageLocalPath)
        console.log('createVehicle>>',req.files
        )
        try {
            const vehicle = new Vehicle({
                ...req.body,
                vehicleImage
            });
            const savedVehicle = await vehicle.save();
            return sendSuccessResponse(res, CREATED, 'Vehicle created successfully', savedVehicle);
        } catch (error) {
            console.log(error)
            return sendErrorResponse(res, BAD_REQUEST, 'Error creating vehicle', error);
        }
    }

    async getVehicles(req, res) {
        try {
            const vehicles = await Vehicle.find().populate('driver');
            return sendSuccessResponse(res, OK, 'Vehicles retrieved successfully', vehicles);
        } catch (error) {
            return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error fetching vehicles', error.message);
        }
    }

    async getVehicleById(req, res) {
        try {
            const vehicle = await Vehicle.findById(req.params.id).populate('driver');
            if (!vehicle) {
                return sendErrorResponse(res, NOT_FOUND, 'Vehicle not found');
            }
            return sendSuccessResponse(res, OK, 'Vehicle retrieved successfully', vehicle);
        } catch (error) {
            return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error fetching vehicle', error.message);
        }
    }

    async updateVehicle(req, res) {
        try {
            const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('driver');
            if (!vehicle) {
                return sendErrorResponse(res, NOT_FOUND, 'Vehicle not found');
            }
            return sendSuccessResponse(res, OK, 'Vehicle updated successfully', vehicle);
        } catch (error) {
            return sendErrorResponse(res, BAD_REQUEST, 'Error updating vehicle', error.message);
        }
    }

    async deleteVehicle(req, res) {
        try {
            const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
            if (!vehicle) {
                return sendErrorResponse(res, NOT_FOUND, 'Vehicle not found');
            }
            return sendSuccessResponse(res, OK, 'Vehicle deleted successfully', vehicle);
        } catch (error) {
            return sendErrorResponse(res, INTERNAL_SERVER_ERROR, 'Error deleting vehicle', error.message);
        }
    }
}

export default new VehicleController();
