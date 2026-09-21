const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dvb6yjcnn";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hibbullah";

export const uploadToCloudinary = async (fileInput: any): Promise<string> => {
  if (!fileInput) return "";

  /* Direct HTTP / HTTPS URL hole upload korar dorkar nai */
  if (typeof fileInput === "string" && (fileInput.startsWith("http://") || fileInput.startsWith("https://"))) {
    return fileInput;
  }

  /* File object hole uri field extract kora */
  const fileUri = typeof fileInput === "object" ? fileInput.uri : fileInput;

  if (!fileUri) return "";

  const formData = new FormData();

  /* Web vs Mobile (React Native) Platform File Handling */
  if (fileUri.startsWith("data:") || fileUri.startsWith("blob:")) {
    /* Web Blob / Base64 handling */
    const res = await fetch(fileUri);
    const blob = await res.blob();
    formData.append("file", blob);
  } else if (typeof fileInput === "object" && fileInput.file) {
    /* Browser Native File Object */
    formData.append("file", fileInput.file);
  } else {
    /* Mobile Native File Object */
    const filename = fileUri.split("/").pop() || "upload.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: type,
    } as unknown as Blob);
  }

  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("[Cloudinary API Error Payload]:", data);
    throw new Error(data.error?.message || "Cloudinary image upload failed");
  }

  return data.secure_url;
};