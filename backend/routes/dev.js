// backend/routes/dev.js
import express from "express";
import User from "../models/User.js";
import BotProfile from "../models/BotProfile.js";

const router = express.Router();

/**
 * POST /api/dev/seed-bots
 * Creates 5 demo bot users (idempotent).
 * Dev-only route; mount only when NODE_ENV !== 'production'.
 */
router.post("/seed-bots", async (req, res) => {
  try {
    const bots = [
      {
        phone: `+10000000001`,
        name: "Aisha Bot",
        age: 24,
        bio: "Coffee lover. Bot personality 1.",
        interests: ["Coffee", "Movies"],
        photos: [{ url: "https://picsum.photos/seed/aisha/600/800", public_id: "picsum/aisha", isProfile: true }],
        isBot: true,
        influencer: true,
        headline: "Top lifestyle creator",
      },
      {
        phone: `+10000000002`,
        name: "Ravi Bot",
        age: 28,
        bio: "Traveler bot. Loves beaches.",
        interests: ["Travel", "Beaches"],
        photos: [{ url: "https://picsum.photos/seed/ravi/600/800", public_id: "picsum/ravi", isProfile: true }],
        isBot: true,
        influencer: false,
        headline: "Globe trotter",
      },
      {
        phone: `+10000000003`,
        name: "Meera Bot",
        age: 26,
        bio: "Foodie bot. Will try every cafe.",
        interests: ["Food", "Cooking"],
        photos: [{ url: "https://picsum.photos/seed/meera/600/800", public_id: "picsum/meera", isProfile: true }],
        isBot: true,
        influencer: false,
        headline: "Cafe explorer",
      },
      {
        phone: `+10000000004`,
        name: "Arjun Bot",
        age: 30,
        bio: "Gym bot. Fitness first.",
        interests: ["Fitness", "Music"],
        photos: [{ url: "https://picsum.photos/seed/arjun/600/800", public_id: "picsum/arjun", isProfile: true }],
        isBot: true,
        influencer: false,
        headline: "Fitness & beats",
      },
      {
        phone: `+10000000005`,
        name: "Nina Bot",
        age: 23,
        bio: "Artist bot. Sketches & coffee.",
        interests: ["Art", "Sketching"],
        photos: [{ url: "https://picsum.photos/seed/nina/600/800", public_id: "picsum/nina", isProfile: true }],
        isBot: true,
        influencer: true,
        headline: "Creative storyteller",
      },
    ];

    const created = [];
    for (const b of bots) {
      let user = await User.findOne({ phone: b.phone });
      if (!user) {
        user = await User.create({
          phone: b.phone,
          name: b.name,
          age: b.age,
          bio: b.bio,
          interests: b.interests,
          photos: b.photos,
          isBot: true,
        });
        created.push({ phone: b.phone, created: true });
      } else {
        user.name = b.name;
        user.age = b.age;
        user.bio = b.bio;
        user.interests = b.interests;
        user.photos = b.photos;
        user.isBot = true;
        await user.save();
        created.push({ phone: b.phone, updated: true });
      }

      // ensure BotProfile (referral/influencer metadata)
      await BotProfile.createOrUpdateFor(user._id, {
        influencer: Boolean(b.influencer),
        headline: b.headline || "",
        ctaUrl: b.ctaUrl || "",
      });
    }

    return res.json({ ok: true, created });
  } catch (err) {
    console.error("POST /api/dev/seed-bots error:", err);
    return res.status(500).json({ ok: false, error: "Server error", details: err?.message });
  }
});

export default router;
