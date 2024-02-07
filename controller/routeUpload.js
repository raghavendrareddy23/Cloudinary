const express = require('express');
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../middleware/multer");
const File = require('../model/fileMode'); 
const fs = require('fs');


router.post('/upload', upload.single('image'), async function (req, res) {
  try {
    const folder = 'images'; 
    const result = await cloudinary.uploader.upload(req.file.path, { folder: folder });

    // Create a new record in the database for the uploaded file
    const file = new File({
      filename: req.file.originalname,
      cloudinary_id: result.public_id,
      url: result.secure_url
    });
    await file.save();

    res.status(200).json({
      success: true,
      folder: folder,
      message: "Uploaded!",
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error"
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json({ success: true, data: files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error retrieving files' });
  }
});


router.get('/:id', async function(req, res) {
  try {
    const file = await File.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: file
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error"
    });
  }
});



router.put('/:id', upload.single('image'), async function(req, res) {
  try {
    const { filename } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found in the database"
      });
    }

    await cloudinary.uploader.destroy(file.cloudinary_id);

    const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: 'images', public_id: filename });

    const updatedUrl = `https://res.cloudinary.com/${cloudinary.config().cloud_name}/image/upload/${uploadResult.public_id}`;

    await File.findByIdAndUpdate(req.params.id, {
      filename: uploadResult.public_id,
      cloudinary_id: uploadResult.public_id,
      url: updatedUrl
    });

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "File updated successfully",
      cloudinaryResult: uploadResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error"
    });
  }
});

router.delete('/:id', async function(req, res) {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found in the database"
      });
    }
    await cloudinary.uploader.destroy(file.cloudinary_id, { invalidate: true });

    await File.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error"
    });
  }
});



module.exports = router;

