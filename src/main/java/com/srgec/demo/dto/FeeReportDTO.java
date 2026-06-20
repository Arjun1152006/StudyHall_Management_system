package com.srgec.demo.dto;

public class FeeReportDTO {

    private String hall;

    private int totalStudents;

    private int feesCollected;

    private int feesPending;

    private String collectionRate;

    public FeeReportDTO() {
    }

    public String getHall() {
        return hall;
    }

    public void setHall(String hall) {
        this.hall = hall;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public int getFeesCollected() {
        return feesCollected;
    }

    public void setFeesCollected(int feesCollected) {
        this.feesCollected = feesCollected;
    }

    public int getFeesPending() {
        return feesPending;
    }

    public void setFeesPending(int feesPending) {
        this.feesPending = feesPending;
    }

    public String getCollectionRate() {
        return collectionRate;
    }

    public void setCollectionRate(String collectionRate) {
        this.collectionRate = collectionRate;
    }
}