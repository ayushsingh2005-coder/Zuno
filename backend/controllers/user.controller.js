const userService = require("../services/user.service");
const { cloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const User = require("../models/user.model");

// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
module.exports.getProfile = async (req, res) => {
  try {
    // req.user auth middleware se aaya ✅
    return successResponse(res, "Profile fetched", { user: req.user });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// UPDATE PROFILE — name, lastname
// ─────────────────────────────────────────
module.exports.updateProfile = async (req, res) => {
  try {
    const { firstname, lastname } = req.body;

    if (!firstname) {
      return errorResponse(res, "First name is required", 400);
    }

    // Dynamic update object banao
    const updateData = {
      "fullname.firstname": firstname,  // Nested field update
    };

    if (lastname) {
      updateData["fullname.lastname"] = lastname;
    }

    const user = await userService.updateProfile(req.user._id, updateData);

    return successResponse(res, "Profile updated", { user });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// UPDATE PROFILE PICTURE
// ─────────────────────────────────────────
module.exports.updateProfilePic = async (req, res) => {
  try {
    // File aaya?
    if (!req.file) {
      return errorResponse(res, "Image is required", 400);
    }

    // Purani profile pic delete karo Cloudinary se
    const currentUser = await userService.findById(req.user._id);
    if (currentUser.profilePicture?.public_id) {
      await cloudinary.uploader.destroy(currentUser.profilePicture.public_id);
    }

    // Nayi pic save karo
    const user = await userService.updateProfile(req.user._id, {
      profilePicture: {
        url: req.file.path,           // Cloudinary URL
        public_id: req.file.filename, // Delete ke liye
      },
    });

    return successResponse(res, "Profile picture updated", {
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Update pic error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────
module.exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Current and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, "New password must be atleast 6 characters", 400);
    }

    // Password field select karo (select: false hai schema mein)
    const user = await User.findById(req.user._id).select("+password");

    // Current password sahi hai?
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 401);
    }

    // Naya password hash karo
    const hashedPassword = await User.hashPassword(newPassword);

    // Save karo
    await userService.updateProfile(req.user._id, {
      password: hashedPassword,
    });

    return successResponse(res, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};