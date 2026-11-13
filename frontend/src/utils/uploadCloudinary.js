const cloud_name = import.meta.env.VITE_CLOUD_NAME;
const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;

const fileToCompressedDataUrl = (file, maxDim = 320) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ url: canvas.toDataURL("image/jpeg", 0.8) });
      };
      img.onerror = () => resolve({ url: reader.result });
      img.src = reader.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

const uploadImageToCloudinary = async (file) => {
  if (!file) return { url: "" };

  // Fallback to local compressed Data URL when Cloudinary env vars are not configured
  if (!cloud_name || !upload_preset) {
    return fileToCompressedDataUrl(file);
  }

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", upload_preset);
  uploadData.append("cloud_name", cloud_name);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    {
      method: "post",
      body: uploadData,
    }
  );

  const data = await res.json();
  if (!res.ok || !data?.url) {
    return fileToCompressedDataUrl(file);
  }
  return data;
};

export default uploadImageToCloudinary;
