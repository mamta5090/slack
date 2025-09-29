import User from "../models/User.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('>>> Register request body:', req.body);

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const login = async (req, res) => {
  try {
    console.log(">>> LOGIN HIT - body:", req.body);
    const { email, password } = req.body || {};

    if (!email || !password) {
      console.warn("Login validation failed - missing fields");
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    console.log(">>> User lookup result:", !!user, user ? user._id : null);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(">>> bcrypt.compare result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email,profileImage:user.profileImage },
    });
  } catch (err) {
    console.error("LOGIN ERROR (stack):", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error during login" });
  }
};




export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, 
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging out" });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    console.log(req.headers);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const getSingleUser=async(req,res)=>{
 try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// controller/user.controller.js

export const editProfile = async (req, res) => {
    try {
        // Ensure the logged-in user can only edit their own profile
        if (req.userId !== req.params.id) {
            return res.status(403).json({ message: "Forbidden: You can only edit your own profile." });
        }

        const { name, displayName, role, number, location, namePronunciation, email, date,title,topic  } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if they were provided in the request
        user.name = name || user.name;
        user.displayName = displayName || user.displayName;
        user.role = role || user.role;
        user.number = number || user.number;
        user.location = location || user.location;
        user.namePronunciation = namePronunciation || user.namePronunciation;
        user.email = email || user.email;
        user.date = date || user.date;
         user.title = title || user.title; 
         user.topic=topic || user.topic;

        // If a new file was uploaded, update the profileImage path
        if (req.file) {
            // Prepend the path for serving static files
            user.profileImage = `uploads/${req.file.filename}`;
        }

        const updatedUser = await user.save();
        
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("editProfile error:", error);
        return res.status(500).json({ message: `editProfile error: ${error.message}` });
    }
};

export const getProfile=async(req,res)=>{
  try {
    const {userName}=req.params;
    const user=await User.findOne({userName}).select("-password")
  if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 return res.status(200).json(user)
  }catch (error) {
    return res.status(500).json({message:`edit prfile error ${error}`})
  }
}

