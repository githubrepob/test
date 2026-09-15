import api from "../api/axios";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data; // { url, publicId }
};
