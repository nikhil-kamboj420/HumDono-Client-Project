// frontend/src/lib/upload.js
import { axiosInstance } from "./axios";

/**
 * Upload a photo to the server → Cloudinary → returns:
 *  {
 *    ok: true,
 *    url,
 *    public_id,
 *    user?,              // if save=true
 *    isProfileComplete?  // if save=true
 *  }
 *
 * @param {File} file
 * @param {boolean} saveToUser - if true, file also gets added to user.photos[]
 */
export async function uploadPhoto(file, saveToUser = false) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const form = new FormData();
  form.append("photo", file);

  try {
    const res = await axiosInstance.post(
      `/users/upload-photo?save=${saveToUser}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data; // { ok, url, public_id, user? }
  } catch (err) {
    console.error("Upload failed:", err?.response?.data || err);
    throw err;
  }
}
