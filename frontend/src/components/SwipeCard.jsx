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
  onDislike,
  onRequestPhone,
  onMessage,
  onSendFriendRequest,
}) {
  const navigate = useNavigate();

  const photo =
    (profile.photos && profile.photos[0]?.url) || "/placeholder.png";

  const maskPhone = (p = "") => {
    if (!p) return "";
    const s = String(p);
    // keep first 3-4 digits (country code or start) and mask the rest
    if (s.length <= 4) return "XXXX";
    const keep = s.slice(0, Math.min(4, s.length));
    return keep + "XXXXXXX";
  };

  const handleMessage = () => {
    // Check if user is male
    const isMale = currentUser?.gender?.toLowerCase() === 'male';
    const hasLifetimeSubscription = currentUser?.subscription?.isLifetime === true;
    const userCoins = currentUser?.coins || 0;

    // MALE USER LOGIC
    if (isMale) {
      // Check if has lifetime subscription
      if (!hasLifetimeSubscription) {
        // No subscription -> Redirect to subscription page
        navigate("/subscription");
        return;
      }
      
      // Has subscription, check coins (hidden from user)
      if (userCoins < 10) {
        // Not enough coins -> Redirect to wallet
        navigate("/wallet");
        return;
      }
      
      // Has subscription and coins -> Allow messaging
      if (typeof onMessage === "function") {
        return onMessage(profile);
      }
    }

    // FEMALE USER LOGIC - Free messaging
    if (typeof onMessage === "function") {
      return onMessage(profile);
    }

    // bot -> force wallet/subscription flow
    if (profile.isBot) {
      navigate("/wallet");
      return;
    }

    // matched with phone -> open whatsapp
    if (profile.isMatched && profile.phone) {
      const num = String(profile.phone).replace(/\D/g, "");
      if (num) {
        window.open(`https://wa.me/${num}`, "_blank");
        return;
      }
    }

    // default -> request access
    if (typeof onRequestPhone === "function") {
      onRequestPhone(profile._id);
      return;
    }

    // fallback
    alert("Requesting access...");
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-xl bg-white shadow-lg overflow-hidden flex flex-col h-full lg:h-[75vh]">
      {/* SEND MESSAGE button (prominent) - fixed position */}
      <div className="px-4 sm:px-5 lg:px-6 py-3 border-b shrink-0 bg-white z-10">
        <button
          onClick={handleMessage}
          className="w-full flex items-center justify-center gap-3 bg-[#0b76ff] hover:bg-[#0665e6] text-white font-semibold py-3 lg:py-4 rounded-lg shadow text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>SEND MESSAGE</span>
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto profile-scroll lg:max-h-[55vh]">
        {/* Large profile image - now scrollable */}
        <div className="w-full h-[45vh] sm:h-[50vh] lg:h-[55vh] bg-gray-100 relative">
          <img
            src={photo}
            alt={profile.name || "profile"}
            className="w-full h-full object-cover"
          />
          {/* Scroll hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs animate-bounce flex items-center gap-1">
            <span>Scroll</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
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
        {/* Profile summary */}
        <div className="px-4 sm:px-5 lg:px-6 py-4 bg-white relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                {profile.name || "Unnamed"}
                {profile.age ? `, ${profile.age}` : ""}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {profile.location?.city && (
                  <span className="text-sm sm:text-base text-gray-600">
                    {profile.location.city}
                  </span>
                )}

                {/* Last active indicator */}
                {profile.lastActiveAt && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Recently active</span>
                  </div>
                )}

                {/* verification badge */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs sm:text-sm">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-500 mb-2">
                About
              </div>
              <div className="text-base text-gray-900 leading-relaxed">
                {profile.bio}
              </div>
            </div>
          )}

          {/* Basic info */}
          <div className="mt-4 space-y-3">
            {profile.education && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Education
                </div>
                <div className="text-base text-gray-900">
                  {profile.education}
                </div>
              </div>
            )}

            {(profile.profession || profile.occupation) && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Profession
                </div>
                <div className="text-base text-gray-900">
                  {profile.profession || profile.occupation}
                </div>
              </div>
            )}

            {profile.relationshipStatus && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Relationship Status
                </div>
                <div className="text-base text-gray-900 capitalize">
                  {profile.relationshipStatus}
                </div>
              </div>
            )}

            {profile.gender && (
              <div>
                <div className="text-sm font-medium text-gray-500">Gender</div>
                <div className="text-base text-gray-900 capitalize">
                  {profile.gender}
                </div>
              </div>
            )}

            {profile.pronouns && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Pronouns
                </div>
                <div className="text-base text-gray-900">
                  {profile.pronouns}
                </div>
              </div>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Languages
                </div>
                <div className="text-base text-gray-900">
                  {profile.languages.join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photo Gallery */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="px-4 sm:px-5 lg:px-6 py-4 border-t">
            <div className="text-sm font-medium text-gray-500 mb-3">
              More Photos
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {profile.photos.slice(1, 5).map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
            {profile.photos.length > 5 && (
              <div className="text-center mt-3">
                <span className="text-sm text-gray-500">
                  +{profile.photos.length - 5} more photos
                </span>
              </div>
            )}
          </div>
        )}

        {/* Verification section */}
        <div className="px-4 sm:px-5 lg:px-6 py-4 border-t">
          <div className="text-sm font-medium text-gray-500 mb-3">
            Verification & Contact
          </div>

          {/* Verification badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.verification?.phoneVerified || profile.phoneVerified) && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Phone Verified
              </div>
            )}

            {profile.verification?.photoVerified && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Photo Verified
              </div>
            )}

            {profile.verification?.idVerified && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                ID Verified
              </div>
            )}
          </div>

          {/* Phone contact */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm sm:text-base font-semibold text-gray-800">
                {profile.phone ? maskPhone(profile.phone) : "Hidden"}
              </div>
              <button
                onClick={() => {
                  if (profile.isBot) return navigate("/wallet");
                  if (typeof onRequestPhone === "function")
                    onRequestPhone(profile._id);
                }}
                className="text-sm sm:text-base text-blue-600 mt-1 hover:text-blue-800"
              >
                Request Access
              </button>
            </div>
          </div>
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="px-4 sm:px-5 lg:px-6 py-4 border-t">
            <div className="text-sm font-medium text-gray-500 mb-3">
              Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-800"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle preferences */}
        {(profile.drinking || profile.smoking || profile.eating) && (
          <div className="px-4 sm:px-5 lg:px-6 py-4 border-t">
            <div className="text-sm font-medium text-gray-500 mb-3">
              Lifestyle
            </div>
            <div className="space-y-3">
              {profile.drinking && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍷</span>
                    <span className="text-sm font-medium text-gray-700">
                      Drinking
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 capitalize">
                    {profile.drinking}
                  </span>
                </div>
              )}

              {profile.smoking && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚭</span>
                    <span className="text-sm font-medium text-gray-700">
                      Smoking
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 capitalize">
                    {profile.smoking}
                  </span>
                </div>
              )}

              {profile.eating && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥗</span>
                    <span className="text-sm font-medium text-gray-700">
                      Diet
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 capitalize">
                    {profile.eating}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium Status */}
        {profile.subscription?.active && (
          <div className="px-4 sm:px-5 lg:px-6 py-4 border-t">
            <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <span className="text-2xl">👑</span>
              <span className="text-sm font-semibold text-yellow-800 capitalize">
                {profile.subscription.plan} Member
              </span>
            </div>
          </div>
        )}


      </div>

      {/* Fixed bottom action bar */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 border-t bg-white shrink-0 z-20">
        <button
          onClick={() => onDislike && onDislike(profile._id)}
          className=" flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl border border-pink-200 text-white hover:bg-pink-50 hover:border-pink-300 transition-colors text-sm sm:text-base font-medium"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          SKIP
        </button>

        <button
          onClick={() => onLike && onLike(profile._id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl bg-romantic-gradient text-white hover:shadow-lg hover:scale-105 transition-all text-sm sm:text-base font-medium"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              strokeWidth="1.5"
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
