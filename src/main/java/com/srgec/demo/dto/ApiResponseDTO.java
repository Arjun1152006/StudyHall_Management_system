package com.srgec.demo.dto;

public class ApiResponseDTO {

    private String message;

    public ApiResponseDTO() {
    }

    public ApiResponseDTO(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}