const User = require("../models/user.model");


const createUser = async ({ firstname, lastname, email, password }) => {
  if (!firstname || !email || !password) {
    throw new Error("All fields are required");
  }

  const user = await User.create({
    fullname: { firstname, lastname },
    email,
    password,
  });

  return user;
};

// Email se user dhundo
const findByEmail = async (email) => {
  return await User.findOne({ email });
};

// ID se user dhundo
const findById = async (id) => {
  return await User.findById(id);
};

// User verify karo
const verifyUser = async (email) => {
  return await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );
};

// Profile update karo
const updateProfile = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  verifyUser,
  updateProfile,
};