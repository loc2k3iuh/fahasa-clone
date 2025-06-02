package com.example.vuvisa.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
	EMAIL_ALREADY_EXISTS(1002, "Email already exists", HttpStatus.BAD_REQUEST),
	EMAIL_INVALID(1001, "Email must be in the format example@gmail.com", HttpStatus.BAD_REQUEST),
	EMAIL_REQUIRED(1006, "Email cannot be empty", HttpStatus.BAD_REQUEST),
	PHONE_ALREADY_EXISTS(1008, "Phone already exists", HttpStatus.BAD_REQUEST),
	PHONE_INVALID(1012, "Phone number must start with 09, 03, 02, or 07 and have 10 digits", HttpStatus.BAD_REQUEST),
	PHONE_REQUIRED(1013, "Phone number cannot be empty", HttpStatus.BAD_REQUEST),
	ADDRESS_REQUIRED(1014, "Address cannot be empty", HttpStatus.BAD_REQUEST),
	ADDRESS_INVALID_CHARACTERS(1014, "Address can only contain letters, numbers, and spaces", HttpStatus.BAD_REQUEST),
	DATE_OF_BIRTH_REQUIRED(1015, "Date of birth cannot be empty", HttpStatus.BAD_REQUEST),
	DATE_OF_BIRTH_INVALID(1016, "Invalid date of birth", HttpStatus.BAD_REQUEST),
	FULL_NAME_REQUIRED(1011, "Full name cannot be empty", HttpStatus.BAD_REQUEST),
	FULL_NAME_INVALID(1023, "Full name must be at least {min} characters", HttpStatus.BAD_REQUEST),
	FULL_NAME_INVALID_CHARACTERS(1012, "Full name can only contain letters and spaces", HttpStatus.BAD_REQUEST),
	USERNAME_REQUIRED(1005, "Username cannot be empty", HttpStatus.BAD_REQUEST),
	USERNAME_INVALID(1024, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
	USERNAME_ALREADY_EXISTS(1030, "Username already exists", HttpStatus.BAD_REQUEST),
	PASSWORD_REQUIRED(1007, "Password cannot be empty", HttpStatus.BAD_REQUEST),
	RE_PASSWORD_REQUIRED(1016, "Retype password cannot be empty", HttpStatus.BAD_REQUEST),
	UNCATEGORIZED(1000, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
	PASSWORD_INVALID(1003, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
	PASSWORD_NOT_MATCH(1010, "Password and retype password are not the same", HttpStatus.BAD_REQUEST),
	UNAUTHENTICATED(1017, "Unauthenticated", HttpStatus.UNAUTHORIZED),
	ACCESS_DENIED(1018, "You do not have permission", HttpStatus.FORBIDDEN),
	ROLE_NOT_FOUND(1009, "Role not found", HttpStatus.NOT_FOUND),
	USER_NOT_FOUND(1004, "User not found", HttpStatus.NOT_FOUND),
	USER_INACTIVATED(1026, "User is not activated", HttpStatus.UNAUTHORIZED),
	PERMISSION_NOT_FOUND(1019, "Permission not found", HttpStatus.NOT_FOUND),
	DESCRIPTION_REQUIRED(1020, "Description cannot be empty", HttpStatus.BAD_REQUEST),
	NAME_REQUIRED(1021, "Name cannot be empty", HttpStatus.BAD_REQUEST),
	DOB_INVALID(1022, "Date of birth must be at least {min} years old", HttpStatus.BAD_REQUEST),
	UNAUTHORIZED(1025, "Unauthorized", HttpStatus.UNAUTHORIZED),
	FILE_TOO_LARGE(1027, "File size exceeds the limit", HttpStatus.BAD_REQUEST),
	EMAIL_NOT_FOUND(1028, "Email not found", HttpStatus.NOT_FOUND),
	TOKEN_REQUIRED(1029, "Token cannot be empty", HttpStatus.BAD_REQUEST),
	VOUCHER_CODE_ALREADY_EXISTS(2000,"The voucher code already exists", HttpStatus.BAD_REQUEST),
	VOUCHER_NOT_FOUND(2001,"Voucher not found", HttpStatus.NOT_FOUND),
	DISCOUNT_NOT_FOUND(2002, "Discount not found", HttpStatus.NOT_FOUND ),
	REVIEW_NOT_FOUND(2003,"Review not found", HttpStatus.NOT_FOUND),
	PRODUCT_NOT_FOUND(2004, "Product not found", HttpStatus.NOT_FOUND),
	START_DATE_INVALID(2005, "Start date invalid", HttpStatus.BAD_REQUEST),
	END_DATE_INVALID(2006, "End date invalid", HttpStatus.BAD_REQUEST),
	DISCOUNT_NAME_REQUIRED(2007, "Discount cannot be empty", HttpStatus.BAD_REQUEST),
	START_DATE_REQUIRED(2008, "Start date cannot be empty", HttpStatus.BAD_REQUEST),
	END_DATE_REQUIRED(2009, "End date cannot be empty", HttpStatus.BAD_REQUEST),
	TYPE_REQUIRED(2010, "Type is required", HttpStatus.BAD_REQUEST),
	REFRESH_TOKEN_INVALID(1031, "Refresh token is invalid", HttpStatus.UNAUTHORIZED),
	REFRESH_TOKEN_EXPIRED(1032, "Refresh token has expired", HttpStatus.UNAUTHORIZED),
	USER_DISABLED(1033, "User is disabled", HttpStatus.UNAUTHORIZED),
	TOKEN_NOT_FOUND(1034, "Token not found", HttpStatus.NOT_FOUND),
	TOKEN_CONFIRMED(1035, "Token has already been confirmed", HttpStatus.BAD_REQUEST),
	TOKEN_EXPIRED(1036, "Token has expired", HttpStatus.BAD_REQUEST),

	// Message related error codes
	MESSAGE_ROOM_NOT_FOUND(1037, "Message room not found", HttpStatus.NOT_FOUND),
	USER_NOT_MEMBER_OF_ROOM(1038, "User is not a member of this room", HttpStatus.FORBIDDEN),
	MESSAGE_NOT_FOUND(1039, "Message not found", HttpStatus.NOT_FOUND);


	private int code;
	private String message;
	private HttpStatusCode httpStatusCode;

	ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
		this.code = code;
		this.message = message;
		this.httpStatusCode = httpStatusCode;
	}
}
