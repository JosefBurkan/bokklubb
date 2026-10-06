import { v2 as cloudinary } from "cloudinary";

// Cloudinary automatically reads CLOUDINARY_URL from the .env file.
// This file must only be imported by server-side code.
export { cloudinary };