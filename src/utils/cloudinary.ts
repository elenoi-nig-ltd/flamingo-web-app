// utils/cloudinary.ts
import axios from 'axios';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface CloudinaryUploadOptions {
  uploadPreset?: string;
  folder?: string;
  transformation?: any[];
}

export class CloudinaryError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'CloudinaryError';
  }
}


/**
 * Uploads an image file to Cloudinary
 * @param file - The image file to upload
 * @param options - Additional upload options
 * @returns Promise with Cloudinary upload response
 */
export const uploadImageToCloudinary = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = options.uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new CloudinaryError('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    if (options.transformation) {
      formData.append('transformation', JSON.stringify(options.transformation));
    }

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!response.data.secure_url) {
      throw new CloudinaryError('No secure URL returned from Cloudinary');
    }

    return response.data;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        throw new CloudinaryError(
          `Cloudinary upload failed: ${error.response.status} ${error.response.statusText}`,
          error
        );
      } else if (error.request) {
        // Request made but no response received
        throw new CloudinaryError('Cloudinary upload failed: No response received from server', error);
      }
    }
    
    throw new CloudinaryError(
      error instanceof Error ? error.message : 'Unknown error occurred during upload',
      error
    );
  }
};

/**
 * Uploads multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @param options - Additional upload options
 * @returns Promise with array of Cloudinary upload responses
 */
export const uploadMultipleImagesToCloudinary = async (
  files: File[],
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse[]> => {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Deletes an image from Cloudinary using its public ID
 * @param publicId - The public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new CloudinaryError('Cloudinary configuration is missing for deletion');
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = await generateCloudinarySignature(publicId, timestamp);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        public_id: publicId,
        timestamp,
        signature,
        api_key: apiKey,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
    throw new CloudinaryError(
      error instanceof Error ? error.message : 'Failed to delete image from Cloudinary',
      error
    );
  }
};

/**
 * Generates Cloudinary signature for secure operations
 * @param publicId - The public ID of the image
 * @param timestamp - Unix timestamp
 * @returns Promise with generated signature
 */
const generateCloudinarySignature = async (publicId: string, timestamp: number): Promise<string> => {
  // In a real implementation, you might want to generate this server-side
  // For client-side, you'd typically make an API call to your backend
  throw new CloudinaryError('Signature generation should be handled server-side for security');
};

/**
 * Alias for uploadImageToCloudinary - Uploads a single image to Cloudinary
 * @param file - The image file to upload
 * @param options - Additional upload options
 * @returns Promise with Cloudinary upload response
 */
export const uploadToCloudinary = uploadImageToCloudinary;