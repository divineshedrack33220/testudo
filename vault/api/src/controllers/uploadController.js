import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../../uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const isCloudinaryConfigured = () => process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const folder = req.body.folder || 'testudo';

    if (isCloudinaryConfigured()) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder, resource_type: 'auto' });
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        });
      } catch (err) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw err;
      }
    }

    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url, publicId: req.file.filename });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ success: false, message: 'Public ID required' });
    
    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      const fileName = path.basename(publicId);
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listImages = async (req, res) => {
  try {
    if (isCloudinaryConfigured()) {
      const { folder = 'testudo', maxResults = 100 } = req.query;
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: Number(maxResults)
      });
      return res.json({ success: true, images: result.resources });
    }

    fs.readdir(uploadsDir, (err, files) => {
      if (err) return res.json({ success: true, images: [] });
      const images = files.map(f => ({
        url: `/uploads/${f}`,
        publicId: f,
        filename: f
      }));
      res.json({ success: true, images });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
