package com.srgec.demo.dto;

public class DashboardDTO {

    private long totalStudents;
    private long totalHalls;

    private int totalFees;
    private int pendingFees;

    private int activeStudents;
    private int leftStudents;

    private int monthlyFeeTotal;

    public DashboardDTO() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalHalls() {
        return totalHalls;
    }

    public void setTotalHalls(long totalHalls) {
        this.totalHalls = totalHalls;
    }

    public int getTotalFees() {
        return totalFees;
    }

    public void setTotalFees(int totalFees) {
        this.totalFees = totalFees;
    }

    public int getPendingFees() {
        return pendingFees;
    }

    public void setPendingFees(int pendingFees) {
        this.pendingFees = pendingFees;
    }

    public int getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(int activeStudents) {
        this.activeStudents = activeStudents;
    }

    public int getLeftStudents() {
        return leftStudents;
    }

    public void setLeftStudents(int leftStudents) {
        this.leftStudents = leftStudents;
    }

    public int getMonthlyFeeTotal() {
        return monthlyFeeTotal;
    }

    public void setMonthlyFeeTotal(int monthlyFeeTotal) {
        this.monthlyFeeTotal = monthlyFeeTotal;
    }
}