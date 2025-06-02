package com.example.vuvisa.validator.dobs;

import java.lang.annotation.*;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import com.example.vuvisa.validator.users.dobs.DobValidator;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {DobValidator.class})
public @interface DobConstraint {

	int min();

	String message() default "Invalid date of birth";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
