package com.example.vuvisa.services.impl;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.vuvisa.services.S3Service;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3ServiceImpl implements S3Service {
	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Autowired
	private S3Client s3Client;

	public String uploadFile(MultipartFile file, String userName) throws IOException {
		String folderName = "users/" + userName;
		String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
		String key = folderName + "/" + fileName;

		PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.acl(ObjectCannedACL.PUBLIC_READ)
				.contentType(file.getContentType())
				.build();

		s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

		return s3Client.utilities()
				.getUrl(GetUrlRequest.builder().bucket(bucketName).key(key).build())
				.toExternalForm();
	}

	@Override
	public String uploadBytes(byte[] bytes, String fileName, String contentType, String folderPath) throws IOException {
		String uniqueFileName = UUID.randomUUID() + "_" + fileName;
		String key = folderPath + "/" + uniqueFileName;

		PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(key)
				.acl(ObjectCannedACL.PUBLIC_READ)
				.contentType(contentType)
				.build();

		s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));

		return s3Client.utilities()
				.getUrl(GetUrlRequest.builder().bucket(bucketName).key(key).build())
				.toExternalForm();
	}
}
