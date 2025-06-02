package com.example.vuvisa.services.impl;

    import com.cloudinary.Cloudinary;
    import com.cloudinary.utils.ObjectUtils;
    import com.example.vuvisa.services.CloudinaryService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;

    import java.util.Map;

    @Service
    @RequiredArgsConstructor
    public class CloudinaryImpl implements CloudinaryService {

        private final Cloudinary cloudinary;

        @Override
        public void deleteImage(String imageUrl) {
            try {
                String publicId = extractPublicId(imageUrl);
                if (publicId != null) {
                    Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
                    System.out.println("Deleted image from Cloudinary: " + result);
                }
            } catch (Exception e) {
                System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }

        @Override
        public void deleteVideo(String videoUrl) {
            try {
                String publicId = extractPublicId(videoUrl);
                if (publicId != null) {
                    Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
                    System.out.println("Deleted video from Cloudinary: " + result);
                }
            } catch (Exception e) {
                System.err.println("Failed to delete video from Cloudinary: " + e.getMessage());
            }
        }

        private String extractPublicId(String url) {
            try {
                int lastSlash = url.lastIndexOf('/');
                int dot = url.lastIndexOf('.');
                return url.substring(lastSlash + 1, dot);
            } catch (Exception e) {
                return null;
            }
        }
    }