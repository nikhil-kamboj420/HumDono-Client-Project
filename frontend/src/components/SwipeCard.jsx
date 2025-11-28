// frontend/src/components/SwipeCard.jsx
import { useNavigate } from "react-router-dom";

/**
 * SwipeCard — Profile card UI matching the screenshot
 *
 * Props:
 *  - profile: { _id, name, age, photos[], bio, interests[], location, phone, phoneVerified, isBot, isMatched, education, profession, drinking, smoking, eating }
 *  - onLike()
 *  - onDislike()
 *  - onRequestPhone()
 *  - onMessage()  // optional override for message action
 *
 * Notes:
 *  - If profile.isBot => message button navigates to /wallet (handled here).
 *  - If profile.isMatched and profile.phone exists => message opens WhatsApp link.
 *  - Otherwise message -> onRequestPhone (request access).
 */
export default function SwipeCard({
  profile = {},
  currentUser = null,
  onLike,
  onSkip,
  onDislike,
  onRequestPhone,
  onMessage,
  disabled = false,
}) {
  const navigate = useNavigate();

  const photo =
    (profile.photos && profile.photos[0]?.url) || "/placeholder.png";

  // Helper to safely trigger actions
  const handleAction = (e, actionFn) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || !actionFn) return;
    actionFn(profile._id);
  };

  const handleMessage = () => {
    const isMale = currentUser?.gender?.toLowerCase() === "male";
    const isFemale = currentUser?.gender?.toLowerCase() === "female";
    const hasLifetimeSubscription =
      currentUser?.subscription?.isLifetime === true;

    // Female users can always send messages
    if (isFemale) {
      if (typeof onMessage === "function") {
        return onMessage(profile);
      }
    }

    // Male users need lifetime subscription to message
    if (isMale) {
      if (!hasLifetimeSubscription) {
        // No subscription - redirect to subscription page
        navigate("/subscription");
        return;
      }
      // Has lifetime subscription - can message freely
      if (typeof onMessage === "function") {
        return onMessage(profile);
      }
    }

    // Fallback for other cases
    if (typeof onMessage === "function") {
      return onMessage(profile);
    }

    if (profile.isBot) {
      navigate("/wallet");
      return;
    }

    if (profile.isMatched && profile.phone) {
      const num = String(profile.phone).replace(/\D/g, "");
      if (num) {
        window.open(`https://wa.me/${num}`, "_blank");
        return;
      }
    }

    if (typeof onRequestPhone === "function") {
      onRequestPhone(profile._id);
      return;
    }

    alert("Requesting access...");
  };

  return (
    <div className="relative z-10 mx-auto max-h-[75vh] bottom-6 w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col h-full border-[6px] border-[#E91E63]">
      {/* Top Action: Send Message */}
      <div className="px-4 py-3 shrink-0 bg-white z-10">
        <button
          onClick={handleMessage}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-black text-white font-semibold py-3.5 rounded-full shadow-lg text-sm sm:text-base transition-colors tracking-wider"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3 7l9 6 9-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-bold">SEND MESSAGE</span>
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto profile-scroll relative bg-white">
        {/* Large profile image */}
        <div className="w-full aspect-[4/5] bg-gray-100 relative shrink-0">
          <img
            src={photo}
            alt={profile.name || "profile"}
            className="w-full h-full object-cover"
          />
          {/* Scroll hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 pointer-events-none">
            <span>Scroll</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-5 py-5 bg-white">
          {/* Name and Age */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {profile.name || "Unnamed"}
            {profile.age ? `, ${profile.age}` : ""}
          </h3>

          {/* Verified Badge */}
          <div className="flex items-center gap-1.5 mb-5">
            <svg
              className="w-4 h-4 text-[#E91E63]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span className="text-[#E91E63] font-medium text-sm">Verified</span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                About
              </h4>
              <p className="text-gray-800 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {[
              { label: "Education", value: profile.education },
              {
                label: "Profession",
                value: profile.profession || profile.occupation,
              },
              { label: "Relationship", value: profile.relationshipStatus },
              { label: "Gender", value: profile.gender },
              { label: "Languages", value: profile.languages?.join(", ") },
            ].map(
              (item, i) =>
                item.value && (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {item.label}
                    </span>
                    <span className="text-gray-900 capitalize">
                      {item.value}
                    </span>
                  </div>
                )
            )}
          </div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Photos */}
          {profile.photos?.length > 1 && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Gallery
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {profile.photos.slice(1, 5).map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar - Skip & Like */}
      <div className="flex items-center gap-4 px-5 py-4 bg-white shrink-0 z-20">
        {/* SKIP Button - Black */}
        <button
          onClick={(e) => handleAction(e, onSkip)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#1a1a1a] hover:bg-black text-white transition-colors font-bold tracking-wider text-sm"
          disabled={disabled}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          SKIP
        </button>

        {/* LIKE Button - Pink/Magenta */}
        <button
          onClick={(e) => handleAction(e, onLike)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#C2185B] hover:bg-[#AD1457] text-white transition-all transform active:scale-95 font-bold tracking-wider text-sm"
          disabled={disabled}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          LIKE
        </button>
      </div>
    </div>
  );
}
