// frontend/src/pages/ProfileCreate.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { uploadPhoto } from "../lib/upload";
import LocationSearch from "../components/LocationSearch";
import InterestSelector from "../components/InterestSelector";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";

// Indian states list
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

export default function ProfileCreate() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const {
    alertConfig,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideAlert,
  } = useCustomAlert();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState({ city: "", state: "" });
  const [lifestyle, setLifestyle] = useState({
    drinking: "",
    smoking: "",
    eating: "",
  });

  const MAX_PHOTOS = 3;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.getUserProfile();
        if (!mounted) return;
        if (res?.ok) {
          const u = res.user;
          setUser(u);
          setName(u.name || "");
          setAge(u.age ?? "");
          setBio(u.bio || "");
          setInterests((u.interests || []).join(", "));
          setRelationshipStatus(u.relationshipStatus || "");
          setGender(u.gender || "");
          setEducation(u.education || "");
          setProfession(u.profession || u.occupation || "");
          setLocation({
            city: u.location?.city || "",
            state: u.location?.state || "",
          });
          setLifestyle({
            drinking: u.drinking || "",
            smoking: u.smoking || "",
            eating: u.eating || "",
          });
          const userPhotos = u.photos || [];
          setPhotos(
            userPhotos.map((p) => ({
              url: p.url,
              public_id: p.public_id,
              isProfile: p.isProfile,
            }))
          );
          setPreviews(userPhotos.map((p) => p.url));
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const parseInterests = (str) => {
    if (!str) return [];
    return str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) {
      showWarning(
        `Maximum ${MAX_PHOTOS} photos allowed. Please delete a photo to add a new one.`,
        "Photo Limit Reached"
      );
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviews((prev) => [...prev, url]);

    try {
      const res = await uploadPhoto(file, true);
      if (res?.ok) {
        if (res.user) {
          const userPhotos = res.user.photos || [];
          setPhotos(
            userPhotos.map((p) => ({
              url: p.url,
              public_id: p.public_id,
              isProfile: p.isProfile,
            }))
          );
          setPreviews(userPhotos.map((p) => p.url));
          setUser(res.user);
        } else {
          setPhotos((prev) => [
            ...prev,
            { url: res.url, public_id: res.public_id },
          ]);
        }
        showSuccess("Photo uploaded successfully! 📸", "Upload Success");
      } else {
        showError("Upload failed. Please try again.", "Upload Failed");
        setPreviews((prev) => prev.slice(0, -1));
      }
    } catch (err) {
      console.error("Upload error:", err);
      showError(
        err?.response?.data?.error || "Upload failed. Please try again.",
        "Upload Error"
      );
      setPreviews((prev) => prev.slice(0, -1));
    }
  };

  const setAsProfile = async (public_id) => {
    try {
      setLoading(true);
      const res = await api.setProfilePhoto(public_id);
      if (res?.ok) {
        setUser(res.user);
        const userPhotos = res.user.photos || [];
        setPhotos(
          userPhotos.map((p) => ({
            url: p.url,
            public_id: p.public_id,
            isProfile: p.isProfile,
          }))
        );
        setPreviews(userPhotos.map((p) => p.url));
        showSuccess("Profile photo updated successfully! 📸", "Photo Updated");
      } else {
        showError(
          "Failed to set profile photo. Please try again.",
          "Update Failed"
        );
      }
    } catch (err) {
      console.error("Set profile photo failed:", err);
      showError(
        "Failed to set profile photo. Please try again.",
        "Update Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (public_id) => {
    showConfirm(
      "Are you sure you want to delete this photo? This action cannot be undone.",
      async () => {
        try {
          setLoading(true);
          const res = await api.deletePhoto(public_id);
          if (res?.ok) {
            setUser(res.user);
            const userPhotos = res.user.photos || [];
            setPhotos(
              userPhotos.map((p) => ({
                url: p.url,
                public_id: p.public_id,
                isProfile: p.isProfile,
              }))
            );
            setPreviews(userPhotos.map((p) => p.url));
            showSuccess("Photo deleted successfully! 🗑️", "Photo Deleted");
          } else {
            showError(
              "Failed to delete photo. Please try again.",
              "Delete Failed"
            );
          }
        } catch (err) {
          console.error("Delete photo failed:", err);
          showError(
            "Failed to delete photo. Please try again.",
            "Delete Failed"
          );
        } finally {
          setLoading(false);
        }
      },
      "Delete Photo?"
    );
  };

  const handleSave = async () => {
    // Validation: Name required
    if (!name?.trim()) {
      showWarning("Please enter your name to continue.", "Name Required");
      return;
    }

    // Validation: Age required and valid
    const ageNum = age ? Number(age) : undefined;
    if (ageNum !== undefined && (isNaN(ageNum) || ageNum < 18)) {
      showWarning(
        "Please enter a valid age. You must be at least 18 years old.",
        "Invalid Age"
      );
      return;
    }

    // Validation: Photo required (MANDATORY)
    if (photos.length === 0) {
      showError(
        "Please upload at least one photo to continue. Photos are required!",
        "Photo Required"
      );
      return;
    }

    await saveProfile(ageNum);
  };

  const saveProfile = async (ageNum) => {
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        age: ageNum,
        bio: bio || "",
        interests: parseInterests(interests),
        relationshipStatus: relationshipStatus || "",
        gender: gender || "",
        education: education || "",
        profession: profession || "",
        location: {
          city: location.city || "",
          state: location.state || "",
        },
        drinking: lifestyle.drinking || "",
        smoking: lifestyle.smoking || "",
        eating: lifestyle.eating || "",
      };
      const res = await api.updateProfile(payload);
      if (res?.ok) {
        setUser(res.user);
        showSuccess(
          "Profile saved successfully! You're all set to start matching! 💕",
          "Profile Saved"
        );
        setTimeout(() => nav("/"), 1500);
      } else {
        console.error("Save failed:", res);
        showError("Failed to save profile. Please try again.", "Save Failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      showError(
        err?.response?.data?.error ||
          "Failed to save profile. Please try again.",
        "Save Error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971] p-4">
      <div className="w-full max-w-xl bg-[#ffebf1] rounded-2xl py-4 px-6 shadow-soft">
        <div className="flex flex-col md:flex-row items-center space-x-4 mb-6">
          <img
            src="/logo.png"
            alt="HumDono Logo"
            className="h-30 w-60 sm:h-30 sm:w-60 lg:h-20 lg:w-60 object-contain"
          />
          <h2 className="text-2xl font-bold text-[#cc0033]">
            Create your profile
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
              placeholder="Your name"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">Age</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              type="number"
              min={18}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
              placeholder="e.g. 26"
            />
          </div>

          {/* Bio */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-[#77001c] mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black h-28"
              placeholder="Tell people a bit about yourself"
            />
          </div>

          {/* Interests */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-[#77001c] mb-1">
              Interests (comma separated)
            </label>
            <InterestSelector
              value={interests}
              onChange={(value) => setInterests(value)}
              placeholder="e.g. Music, Hiking, Cooking"
            />
          </div>

          {/* Relationship Status - Dropdown */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">
              Relationship Status
            </label>
            <select
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="complicated">It's Complicated</option>
            </select>
          </div>

          {/* Gender - Only Male/Female */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Education - Dropdown */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">
              Education
            </label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select</option>
              <option value="High School">High School</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Profession - Dropdown */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">
              Profession
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select</option>
              <option value="Student">Student</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Doctor">Doctor</option>
              <option value="Teacher">Teacher</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Artist">Artist</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* City with GPS */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">City</label>
            <div className="location-search-wrapper">
              <LocationSearch
                value={location.city}
                onChange={(locationData) => {
                  if (typeof locationData === 'string') {
                    // Manual city input
                    setLocation(prev => ({ ...prev, city: locationData }));
                  } else {
                    // GPS location with city and state
                    setLocation({ city: locationData.city, state: locationData.state });
                  }
                }}
                placeholder="Search your city or use GPS"
              />
            </div>
          </div>

          {/* State - Auto-filled from GPS */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">
              State {location.state ? '(Auto-filled from GPS)' : '(Use GPS to auto-fill)'}
            </label>
            <input
              type="text"
              value={location.state}
              onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
              className={`w-full p-3 rounded-xl border border-[#ff4c91] text-black ${
                location.state ? 'bg-green-50' : 'bg-gray-100'
              }`}
              placeholder={location.state ? location.state : 'Use GPS tracker to auto-fill state'}
              readOnly={!location.state}
            />
          </div>

          {/* Drinking - Dropdown */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">
              Drinking
            </label>
            <select
              value={lifestyle.drinking}
              onChange={(e) =>
                setLifestyle((prev) => ({ ...prev, drinking: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select</option>
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>

          {/* Smoking - Dropdown */}
          <div>
            <label className="block text-sm text-[#77001c] mb-1">Smoking</label>
            <select
              value={lifestyle.smoking}
              onChange={(e) =>
                setLifestyle((prev) => ({ ...prev, smoking: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select</option>
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>

          {/* Diet Preference - Dropdown */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-[#77001c] mb-1">
              Diet Preference
            </label>
            <select
              value={lifestyle.eating}
              onChange={(e) =>
                setLifestyle((prev) => ({ ...prev, eating: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black"
            >
              <option value="">Select</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
            </select>
          </div>

          {/* Photos - MANDATORY */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-[#77001c] mb-2">
              Photos (max {MAX_PHOTOS}){" "}
              <span className="text-red-500">* Required</span>
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex gap-2">
                {previews.map((p, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-xl overflow-hidden border relative"
                  >
                    <img
                      src={p}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    {photos[i] && photos[i].isProfile && (
                      <div className="absolute top-1 left-1 px-2 py-1 bg-green-500 text-white text-xs rounded">
                        Profile
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {photos[i]?.public_id && (
                        <>
                          <button
                            onClick={() => setAsProfile(photos[i].public_id)}
                            className="bg-white text-black text-xs px-2 py-1 rounded"
                            title="Set as profile"
                          >
                            Set
                          </button>
                          <button
                            onClick={() => deletePhoto(photos[i].public_id)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                            title="Delete"
                          >
                            Del
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {previews.length < MAX_PHOTOS && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#ff4c91] flex items-center justify-center cursor-pointer bg-white hover:bg-pink-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                    <span className="text-3xl text-[#cc0033]">+</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button Only - No Skip */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#cc0033] to-[#ff1971] shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </div>
  );
}
