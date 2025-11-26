// routes/feed.js
import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import Match from "../models/Match.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Helper to mask phone when no match exists
 */
function maskPhone(phone) {
  if (!phone) return null;
  const p = String(phone);
  // show first 4 chars (or country+first digits) then mask rest
  const visible = p.slice(0, 4);
  return visible + "XXXXXX";
}

/**
 * GET /api/feed
 *
 * Returns candidate profiles for the current user with advanced filtering.
 * - Excludes self
 * - Excludes users already interacted with by current user
 * - If matched -> returns real phone, else returns masked phone
 * - Supports filters: age, location, relationship status, gender, verification, photos
 */
router.get("/", auth, async (req, res) => {
  try {
    const meId = req.user.userId;
    
    // Debug: Log all query parameters
    console.log('🔍 Feed Filter Request:', {
      minAge: req.query.minAge,
      maxAge: req.query.maxAge,
      gender: req.query.gender,
      relationshipStatus: req.query.relationshipStatus,
      city: req.query.city,
      education: req.query.education,
      drinking: req.query.drinking,
      smoking: req.query.smoking,
      eating: req.query.eating,
      verifiedOnly: req.query.verifiedOnly,
      hasPhotos: req.query.hasPhotos
    });

    // ensure proper ObjectId usage
    const meObjectId = mongoose.isValidObjectId(meId)
      ? new mongoose.Types.ObjectId(String(meId))
      : meId;

    // Get current user's gender for default filtering
    const currentUser = await User.findById(meObjectId).select("gender lookingFor boosts").lean();
    const myGender = currentUser?.gender?.toLowerCase();

    const limit = Math.min(Number(req.query.limit) || 10, 30);
    const skip = Number(req.query.skip) || 0;
    const minAge = req.query.minAge ? Number(req.query.minAge) : null;
    const maxAge = req.query.maxAge ? Number(req.query.maxAge) : null;
    const city = req.query.city ? String(req.query.city).trim() : null;
    const relationshipStatus = req.query.relationshipStatus ? String(req.query.relationshipStatus) : null;
    
    // Gender filter with smart defaults
    let gender = req.query.gender ? String(req.query.gender) : null;
    
    // DEFAULT BEHAVIOR: Show opposite gender only
    if (!gender || gender === "any") {
      if (myGender === "male") {
        gender = "female"; // Males see only females by default
      } else if (myGender === "female") {
        gender = "male"; // Females see only males by default
      }
      // If user manually sets gender in filters, respect that choice
    }
    
    const verifiedOnly = req.query.verifiedOnly === "true";
    const hasPhotos = req.query.hasPhotos === "true";
    const education = req.query.education ? String(req.query.education).trim() : null;
    const profession = req.query.profession ? String(req.query.profession).trim() : null;
    const drinking = req.query.drinking ? String(req.query.drinking) : null;
    const smoking = req.query.smoking ? String(req.query.smoking) : null;
    const eating = req.query.eating ? String(req.query.eating) : null;

    // base filter: exclude self
    const filter = { _id: { $ne: meObjectId } };

    // Age filters
    if (minAge !== null) filter.age = { ...filter.age, $gte: minAge };
    if (maxAge !== null) filter.age = { ...filter.age, $lte: maxAge };
    
    // Location filter
    if (city) filter["location.city"] = new RegExp(`^${city}`, "i");
    
    // Relationship status filter
    if (relationshipStatus && relationshipStatus !== "any") {
      filter.relationshipStatus = relationshipStatus;
    }
    
    // Gender filter
    if (gender && gender !== "any") {
      filter.gender = gender;
    }
    
    // Verified users only
    if (verifiedOnly) {
      filter["verification.phoneVerified"] = true;
    }
    
    // Users with photos only
    if (hasPhotos) {
      filter.photos = { $exists: true, $not: { $size: 0 } };
    }
    
    // Education filter
    if (education) {
      filter.education = new RegExp(education, "i");
    }
    
    // Profession filter
    if (profession) {
      filter.profession = new RegExp(profession, "i");
    }
    
    // Lifestyle filters
    if (drinking && drinking !== "any") {
      filter["lifestyle.drinking"] = drinking;
    }
    
    if (smoking && smoking !== "any") {
      filter["lifestyle.smoking"] = smoking;
    }
    
    if (eating && eating !== "any") {
      filter["lifestyle.eating"] = eating;
    }
    
    // Debug: Log final filter object
    console.log('📊 MongoDB Filter Object:', JSON.stringify(filter, null, 2));
    
    // Debug: Check total users matching basic criteria
    const totalMatchingUsers = await User.countDocuments({
      gender: gender && gender !== "any" ? gender : { $exists: true },
      relationshipStatus: relationshipStatus && relationshipStatus !== "any" ? relationshipStatus : { $exists: true }
    });
    console.log(`📈 Total users with gender=${gender}, relationship=${relationshipStatus}: ${totalMatchingUsers}`);

    // get users current user already interacted with
    // Only exclude recent interactions (last 10) for "dislike" action
    // This allows skipped profiles to reappear after 10 new interactions
    const recentInteractions = await Interaction.find({ from: meObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("to action")
      .lean();
    
    const recentSkippedIds = recentInteractions
      .filter(x => x.action === "dislike")
      .map(x => String(x.to));
    
    // Always exclude liked users (to prevent duplicate likes)
    const likedUsers = await Interaction.find({ 
      from: meObjectId, 
      action: "like" 
    }).select("to").lean();
    const likedIds = likedUsers.map(x => String(x.to));
    
    // Combine: exclude recent skips + all likes
    const excludeIds = [...new Set([...recentSkippedIds, ...likedIds])];
    
    if (excludeIds.length > 0) {
      // Mongoose will cast string ids to ObjectId for the query
      filter._id.$nin = excludeIds;
    }

    // Sort criteria (currentUser already fetched above)
    let sortCriteria = { lastActiveAt: -1, createdAt: -1 };

    // If user has visibility boost, prioritize their profile in others' feeds
    if (currentUser?.boosts?.visibility && new Date(currentUser.boosts.visibility) > new Date()) {
      sortCriteria = { "boosts.visibility": -1, ...sortCriteria };
    }

    // fetch candidates
    const candidates = await User.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .select("name age photos bio interests location visibilitySettings phone verification relationshipStatus gender education profession lifestyle")
      .lean();
    
    // Debug: Log results count
    console.log(`✅ Found ${candidates.length} candidates matching filters`);

    // prepare keys to check matches
    const candidateIds = candidates.map((c) => String(c._id));
    const usersKeyPairs = candidateIds.map((id) => [String(meId), id].sort().join("_"));

    const matches = await Match.find({ usersKey: { $in: usersKeyPairs } }).select("users usersKey").lean();
    const matchedKeys = new Set(matches.map((m) => m.usersKey));

    // prepare response
    const prepared = candidates.map((c) => {
      const usersKey = [String(meId), String(c._id)].sort().join("_");
      const isMatched = matchedKeys.has(usersKey);

      return {
        _id: c._id,
        name: c.name,
        age: c.age,
        photos: c.photos || [],
        bio: c.bio,
        interests: c.interests || [],
        location: c.location || {},
        relationshipStatus: c.relationshipStatus,
        gender: c.gender,
        education: c.education,
        profession: c.profession,
        lifestyle: c.lifestyle || {},
        isMatched,
        phone: isMatched ? (c.phone || null) : maskPhone(c.phone),
        phoneVerified: c.verification?.phoneVerified ?? false,
      };
    });

    return res.json({ ok: true, results: prepared });
  } catch (err) {
    console.error("GET /api/feed error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/feed/filters
 * Get available filter options
 */
router.get("/filters", auth, async (req, res) => {
  try {
    const filterOptions = {
      relationshipStatus: ["single", "married", "divorced", "widowed", "complicated"],
      gender: ["male", "female", "other"],
      ageRange: { min: 18, max: 80 },
      cities: [] // Could be populated from database
    };

    // Get popular cities from user data
    const popularCities = await User.aggregate([
      { $match: { "location.city": { $exists: true, $ne: "" } } },
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { city: "$_id", _id: 0 } }
    ]);

    filterOptions.cities = popularCities.map(item => item.city);

    res.json({ ok: true, filterOptions });
  } catch (err) {
    console.error("GET /api/feed/filters error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;