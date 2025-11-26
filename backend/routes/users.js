// routes/users.js
import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// configure cloudinary via env
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// helper upload stream
function uploadToCloudinary(buffer, folder = "humdono") {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
}

// small helper to determine profile completeness
function isProfileComplete(user) {
  if (!user) return false;
  const hasName = Boolean(user.name && String(user.name).trim().length > 0);
  const hasPhoto = Array.isArray(user.photos) && user.photos.length > 0;
  return hasName && hasPhoto;
}

/**
 * GET /api/users/me
 * Returns the current user (without refreshTokens) and a simple isProfileComplete flag.
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-refreshTokens");
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });
    return res.json({ ok: true, user, isProfileComplete: isProfileComplete(user) });
  } catch (err) {
    console.error("GET /api/users/me error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/users/random-females
 * Returns random female profiles for new user popups
 * IMPORTANT: This must come BEFORE /:id route to avoid route collision
 */
router.get("/random-females", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const females = await User.aggregate([
      { 
        $match: { 
          gender: "female",
          photos: { $exists: true, $not: { $size: 0 } },
          name: { $exists: true, $ne: "" }
        }
      },
      { $sample: { size: limit } },
      { 
        $project: {
          name: 1,
          age: 1,
          photos: 1,
          location: 1,
          message: { $literal: "is interested in connecting with you! 💕" }
        }
      }
    ]);
    
    // Transform the data to match expected format
    const transformedFemales = females.map(f => ({
      _id: f._id,
      name: f.name,
      age: f.age,
      photo: f.photos && f.photos.length > 0 ? f.photos[0].url : null,
      location: f.location?.city || "",
      message: f.message
    }));

    res.json({ success: true, profiles: transformedFemales });
  } catch (error) {
    console.error("GET /api/users/random-females error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * GET /api/users/:id
 * Returns a specific user's profile by ID (for viewing other users)
 * IMPORTANT: This must come AFTER specific routes like /random-females
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name age bio photos interests gender location relationshipStatus education occupation socialLinks");
    
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    
    return res.json({ ok: true, user });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /api/users/upload-photo
 * Upload single photo to Cloudinary. If query param ?save=true is present,
 * the uploaded photo will be appended to user's photos array and user returned.
 */
router.post("/upload-photo", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file provided" });

    const result = await uploadToCloudinary(req.file.buffer, "humdono/users");

    // if client wants to immediately save the uploaded photo into user's photos array
    if (req.query.save === "true") {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ ok: false, error: "User not found" });

      user.photos = user.photos || [];
      user.photos.push({
        url: result.secure_url,
        public_id: result.public_id,
        isProfile: user.photos.length === 0, // first uploaded becomes profile by default
      });

      await user.save();
      return res.json({ ok: true, url: result.secure_url, public_id: result.public_id, user, isProfileComplete: isProfileComplete(user) });
    }

    return res.json({ ok: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("POST /api/users/upload-photo error:", err);
    return res.status(500).json({ ok: false, error: "Upload failed" });
  }
});

/**
 * POST /api/users
 * Create/update profile fields: name, age, bio, interests, location, lookingFor, socialLinks, etc.
 * Returns updated user.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { 
      name, age, bio, interests, location, lookingFor, 
      socialLinks, visibilitySettings, relationshipStatus, 
      gender, pronouns, languages, education, occupation 
    } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (lookingFor !== undefined) user.lookingFor = lookingFor;
    if (relationshipStatus !== undefined) user.relationshipStatus = relationshipStatus;
    if (gender !== undefined) user.gender = gender;
    if (pronouns !== undefined) user.pronouns = pronouns;
    if (education !== undefined) user.education = education;
    if (occupation !== undefined) user.occupation = occupation;

    if (interests !== undefined) {
      if (Array.isArray(interests)) {
        user.interests = interests.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof interests === "string") {
        user.interests = interests.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (languages !== undefined) {
      if (Array.isArray(languages)) {
        user.languages = languages.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof languages === "string") {
        user.languages = languages.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks, ...socialLinks };
    }

    if (visibilitySettings !== undefined) {
      user.visibilitySettings = { ...user.visibilitySettings, ...visibilitySettings };
    }

    // Clear subscription requirement for female users
    if (gender !== undefined && gender.toLowerCase() === 'female') {
      user.requiresFirstSubscription = false;
    }

    await user.save();
    return res.json({ ok: true, user, isProfileComplete: isProfileComplete(user) });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * PUT /api/users/set-profile-photo
 * Body: { public_id } - sets the isProfile flag on the specified photo and clears others.
 */
router.put("/set-profile-photo", auth, async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ ok: false, error: "public_id required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    user.photos = (user.photos || []).map((p) => ({
      ...p.toObject ? p.toObject() : p,
      isProfile: p.public_id === public_id,
    }));

    await user.save();
    return res.json({ ok: true, user, isProfileComplete: isProfileComplete(user) });
  } catch (err) {
    console.error("PUT /api/users/set-profile-photo error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * DELETE /api/users/photo/:public_id
 * Deletes photo record from user and attempts to destroy from Cloudinary.
 */
router.delete("/photo/:public_id", auth, async (req, res) => {
  try {
    const public_id = decodeURIComponent(req.params.public_id);
    if (!public_id) return res.status(400).json({ ok: false, error: "public_id required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    // remove from user's photos array
    user.photos = (user.photos || []).filter((p) => p.public_id !== public_id);
    await user.save();

    // try to delete from cloudinary (best-effort)
    try {
      await cloudinary.v2.uploader.destroy(public_id);
    } catch (e) {
      console.warn("Cloudinary destroy failed (non-fatal):", e);
    }

    return res.json({ ok: true, user, isProfileComplete: isProfileComplete(user) });
  } catch (err) {
    console.error("DELETE /api/users/photo/:public_id error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
