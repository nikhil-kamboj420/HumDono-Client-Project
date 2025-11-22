// frontend/src/pages/ProfileCreate.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { uploadPhoto } from "../lib/upload";
import LocationSearch from "../components/LocationSearch";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";

export default function ProfileCreate() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { alertConfig, showSuccess, showError, showWarning, showInfo, showConfirm, hideAlert } = useCustomAlert();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [photos, setPhotos] = useState([]); // [{ url, public_id, isProfile }]
  const [previews, setPreviews] = useState([]); // urls for UI preview
  
  // Advanced profile fields
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState({ city: "", state: "", country: "" });
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: ""
  });
  const [lifestyle, setLifestyle] = useState({
    drinking: "",
    smoking: "",
    eating: ""
  });
  
  const MAX_PHOTOS = 3;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.getUserProfile(); // GET /users/me
        if (!mounted) return;
        if (res?.ok) {
          const u = res.user;
          setUser(u);
          setName(u.name || "");
          setAge(u.age ?? "");
          setBio(u.bio || "");
          setInterests((u.interests || []).join(", "));
          
          // Load advanced fields
          setRelationshipStatus(u.relationshipStatus || "");
          setGender(u.gender || "");
          setEducation(u.education || "");
          setProfession(u.profession || u.occupation || "");
          setLocation({
            city: u.location?.city || "",
            state: u.location?.state || "",
            country: u.location?.country || ""
          });
          setSocialLinks({
            instagram: u.socialLinks?.instagram || "",
            facebook: u.socialLinks?.facebook || "",
            twitter: u.socialLinks?.twitter || "",
            linkedin: u.socialLinks?.linkedin || ""
          });
          setLifestyle({
            drinking: u.drinking || "",
            smoking: u.smoking || "",
            eating: u.eating || ""
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

  // Normalize interests input (comma separated string -> array)
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
      showWarning(`Maximum ${MAX_PHOTOS} photos allowed. Please delete a photo to add a new one.`, 'Photo Limit Reached');
      return;
    }

    // local preview
    const url = URL.createObjectURL(file);
    setPreviews((prev) => [...prev, url]);

    // upload and save to user on server (save=true)
    try {
      const res = await uploadPhoto(file, true); // saveToUser = true
      // expected res: { ok, url, public_id, user? }
      if (res?.ok) {
        // if server returned updated user, sync photos from it
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
          // fallback: append returned url/public_id
          setPhotos((prev) => [
            ...prev,
            { url: res.url, public_id: res.public_id },
          ]);
        }
      } else {
        showError("Upload failed. Please try again.", "Upload Failed");
        // remove last preview
        setPreviews((prev) => prev.slice(0, -1));
      }
    } catch (err) {
      console.error("Upload error:", err);
      showError(err?.response?.data?.error || "Upload failed. Please try again.", "Upload Error");
      setPreviews((prev) => prev.slice(0, -1));
    }
  };

  // set selected photo as profile picture
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
        showError("Failed to set profile photo. Please try again.", "Update Failed");
      }
    } catch (err) {
      console.error("Set profile photo failed:", err);
      showError("Failed to set profile photo. Please try again.", "Update Failed");
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
            showError("Failed to delete photo. Please try again.", "Delete Failed");
          }
        } catch (err) {
          console.error("Delete photo failed:", err);
          showError("Failed to delete photo. Please try again.", "Delete Failed");
        } finally {
          setLoading(false);
        }
      },
      "Delete Photo?"
    );
  };

  const handleSave = async () => {
    // basic validation
    if (!name?.trim()) {
      showWarning("Please enter your name to continue.", "Name Required");
      return;
    }
    const ageNum = age ? Number(age) : undefined;
    if (ageNum !== undefined && (isNaN(ageNum) || ageNum < 18)) {
      showWarning("Please enter a valid age. You must be at least 18 years old.", "Invalid Age");
      return;
    }
    if (photos.length === 0) {
      // optional: require at least one photo
      showConfirm(
        "You haven't uploaded any photos yet. Photos help you get more matches! Are you sure you want to continue without photos?",
        () => saveProfile(ageNum),
        "No Photos Uploaded"
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
          country: location.country || ""
        },
        socialLinks: {
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
          twitter: socialLinks.twitter || "",
          linkedin: socialLinks.linkedin || ""
        },
        drinking: lifestyle.drinking || "",
        smoking: lifestyle.smoking || "",
        eating: lifestyle.eating || ""
      };
      const res = await api.updateProfile(payload);
      if (res?.ok) {
        // sync user
        setUser(res.user);
        showSuccess("Profile saved successfully! You're all set to start matching! 💕", "Profile Saved");
        setTimeout(() => nav("/"), 1500);
      } else {
        console.error("Save failed:", res);
        showError("Failed to save profile. Please try again.", "Save Failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      showError(err?.response?.data?.error || "Failed to save profile. Please try again.", "Save Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971] p-4">
      <div className="w-full max-w-xl bg-[#ffebf1]  rounded-2xl py-4 px-6 shadow-soft">
        <div className="flex flex-col md:flex-row items-center space-x-4 mb-6">
          <img
            src="/logo.png"
            alt="HumDono Logo"
            className="h-30 w-60  sm:h-30 sm:w-60 lg:h-20 lg:w-60 object-contain"
          />
          <h2 className="text-2xl font-bold text-[#cc0033]">
            Create your profile
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-red-500 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-red-500 mb-1">Age</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              type="number"
              min={18}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
              placeholder="e.g. 25"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-red-500 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white h-28"
              placeholder="Tell people a bit about yourself"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-red-500 mb-1">
              Interests (comma separated)
            </label>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
              placeholder="e.g. Music, Hiking, Cooking"
            />
          </div>

          {/* Advanced Profile Fields */}
          <div>
            <label className="block text-sm text-red-500 mb-1">
              Relationship Status
            </label>
            <select
              value={relationshipStatus}
              onChange={(e) => setRelationshipStatus(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="complicated">It's Complicated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-red-500 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-red-500 mb-1">
              Education
            </label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
              placeholder="e.g. Bachelor's in Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm text-red-500 mb-1">
              Profession
            </label>
            <input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
              placeholder="e.g. Software Engineer"
            />
          </div>

          {/* Location Fields */}
          <div>
            <label className="block text-sm text-red-500 mb-1">
              City
            </label>
            <div className="location-search-wrapper">
              <LocationSearch
                value={location.city}
                onChange={(city) => setLocation(prev => ({ ...prev, city }))}
                placeholder="Search your city or use current location"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-red-500 mb-1">
              State
            </label>
            <input
              value={location.state}
              onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
              placeholder="e.g. Maharashtra"
            />
          </div>

          {/* Social Links */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-red-500 mb-2">
              Social Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
                placeholder="Instagram username"
              />
              <input
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
                placeholder="Facebook profile"
              />
              <input
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
                placeholder="Twitter handle"
              />
              <input
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
                placeholder="LinkedIn profile"
              />
            </div>
          </div>

          {/* Lifestyle Preferences */}
          <div>
            <label className="block text-sm text-red-500 mb-1">
              Drinking
            </label>
            <select
              value={lifestyle.drinking}
              onChange={(e) => setLifestyle(prev => ({ ...prev, drinking: e.target.value }))}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
            >
              <option value="">Select</option>
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-red-500 mb-1">
              Smoking
            </label>
            <select
              value={lifestyle.smoking}
              onChange={(e) => setLifestyle(prev => ({ ...prev, smoking: e.target.value }))}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
            >
              <option value="">Select</option>
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-red-500 mb-1">
              Diet Preference
            </label>
            <select
              value={lifestyle.eating}
              onChange={(e) => setLifestyle(prev => ({ ...prev, eating: e.target.value }))}
              className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white"
            >
              <option value="">Select</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-red-500 mb-2">
              Photos (max {MAX_PHOTOS})
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
                    {/* actions */}
                    {photos[i] && photos[i].isProfile && (
                      <div className="absolute top-1 left-1 px-2 py-1 bg-white/80 text-xs rounded">
                        Profile
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {photos[i]?.public_id && (
                        <>
                          <button
                            onClick={() => setAsProfile(photos[i].public_id)}
                            className="bg-white/90 text-xs px-2 py-1 rounded mr-1"
                            title="Set as profile"
                          >
                            Set
                          </button>
                          <button
                            onClick={() => deletePhoto(photos[i].public_id)}
                            className="bg-white/90 text-xs px-2 py-1 rounded"
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
                  <label className="w-20 h-20 rounded-xl border flex items-center justify-center cursor-pointer bg-pink-50 text-pink-600">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                    <span className="text-xl">+</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-romantic px-6 py-3 rounded-2xl text-white font-semibold"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
          <button
            onClick={() => nav("/")}
            className="px-4 py-2 rounded-2xl border border-romantic text-passion hover:bg-pink-50 transition-colors"
          >
            Skip
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
