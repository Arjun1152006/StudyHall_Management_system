package com.srgec.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;
import com.srgec.demo.repository.StudyHallRepository;

@Service
public class DashboardService {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private StudyHallRepository hallRepo;

    public Map<String, Object> getDashboardData() {

        List<Student> students = studentRepo.findAll();

        int totalFees = 0;
        int pendingFees = 0;
        int monthlyFees = 0;
        int activeStudents = 0;
        int leftStudents = 0;

        for (Student s : students) {

            totalFees += s.getFeePaid();
            pendingFees += s.getFeeDue();

            if (s.getMonthlyFee() != null) {
                monthlyFees += s.getMonthlyFee();
            }

            if (s.getLeftDate() == null) {
                activeStudents++;
            } else {
                leftStudents++;
            }
        }

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalStudents", students.size());
        dashboard.put("totalHalls", hallRepo.count());
        dashboard.put("totalFees", totalFees);
        dashboard.put("pendingFees", pendingFees);
        dashboard.put("activeStudents", activeStudents);
        dashboard.put("leftStudents", leftStudents);
        dashboard.put("monthlyFeeTotal", monthlyFees);

        return dashboard;
    }
}