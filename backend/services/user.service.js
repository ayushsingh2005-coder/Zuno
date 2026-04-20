const User = require("../models/user.model");

// create new user
const createUser = async ({firstname , lastname ,email , password}) =>{
    if(!firstname || !email || !password){
        throw new Error("All fields are required");
    }

    const user = await User.create({
        fullname :{
            firstname,
            lastname
        },
        email,
        password,
    });

    return user;
};

// search user by email
const findUserByEmail = async(email) =>{
    return await User.findOne({email});
};

// search user by id
const findUserById = async(id) =>{
    return await User.findById(id);
};

// verify user after otp get verified
const verifyUser = async(email) =>{
    return await User.findOneAndUpdate(
        {email},
        {isVerified : true},
        {new : true}    
    );
};

// Update profile
const updateUserProfile = async(id , updateData) =>{
    return await User.findByIdAndUpdate(
        id,
        updateData,
        {new : true}
    );
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  verifyUser,
  updateProfile,
};