package com.srgec.demo.dto;

import java.time.LocalDate;

public class StudentDTO {

    private Long id;

    private String name;
    private String cabin;
    private String hall;
    private String phone;

    private LocalDate joinDate;
    private LocalDate leftDate;

    private Integer monthlyFee;
    private Integer feePaid;
    private Integer feeDue;

    private String status;

    public StudentDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public String getCabin() {
        return cabin;
    }

    public String getHall() {
        return hall;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public LocalDate getLeftDate() {
        return leftDate;
    }

    public Integer getMonthlyFee() {
        return monthlyFee;
    }

    public Integer getFeePaid() {
        return feePaid;
    }

    public Integer getFeeDue() {
        return feeDue;
    }

    public String getStatus() {
        return status;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCabin(String cabin) {
        this.cabin = cabin;
    }

    public void setHall(String hall) {
        this.hall = hall;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setJoinDate(LocalDate joinDate) {
        this.joinDate = joinDate;
    }

    public void setLeftDate(LocalDate leftDate) {
        this.leftDate = leftDate;
    }

    public void setMonthlyFee(Integer monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public void setFeePaid(Integer feePaid) {
        this.feePaid = feePaid;
    }

    public void setFeeDue(Integer feeDue) {
        this.feeDue = feeDue;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}