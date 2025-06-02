package com.example.vuvisa.validator.users.dobs;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import com.example.vuvisa.validator.dobs.DobConstraint;

public class DobValidator implements ConstraintValidator<DobConstraint, LocalDate> {

	private int min;

	@Override
	public void initialize(com.example.vuvisa.validator.dobs.DobConstraint constraintAnnotation) {
		ConstraintValidator.super.initialize(constraintAnnotation);
		min = constraintAnnotation.min();
	}

	@Override
	public boolean isValid(LocalDate localDate, ConstraintValidatorContext constraintValidatorContext) {

		if (localDate == null) {
			return true; // Not validate if the field is null
		}
		long years = ChronoUnit.YEARS.between(localDate, LocalDate.now());

		return years >= min;
	}
}
