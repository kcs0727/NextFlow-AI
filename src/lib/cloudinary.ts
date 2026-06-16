import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || '',
  api_key: process.env.CLOUD_API || '',
  api_secret: process.env.CLOUD_SECRET || '',
});

export async function uploadToCloudinary(fileString: string, options?: any): Promise<{ secure_url: string }> {
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_API || !process.env.CLOUD_SECRET) {
    console.warn('Cloudinary environment variables are missing! Upload will fail or use mock.');
    // Return a default mock URL if env vars are missing for easy testing/demo
    return { secure_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileString, options, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return reject(error);
      }
      resolve({ secure_url: result?.secure_url || '' });
    });
  });
}

export { cloudinary };
