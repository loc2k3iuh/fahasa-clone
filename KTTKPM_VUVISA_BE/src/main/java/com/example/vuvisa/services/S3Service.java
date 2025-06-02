package com.example.vuvisa.services;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
	String uploadFile(MultipartFile file, String userName) throws IOException;

	/**
	 * Upload a byte array to S3 and return the URL
	 * @param bytes The byte array to upload
	 * @param fileName The name of the file
	 * @param contentType The content type of the file
	 * @param folderPath The folder path in S3 where the file will be stored
	 * @return The URL of the uploaded file
	 * @throws IOException If an I/O error occurs
	 */
	String uploadBytes(byte[] bytes, String fileName, String contentType, String folderPath) throws IOException;
}
