package com.srgec.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;
import com.srgec.demo.repository.StudyHallRepository;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private StudyHallRepository hallRepo;

    @GetMapping
    public Map<String, Object> dashboard() {

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

        Map<String, Object> map = new HashMap<>();

        map.put("totalStudents", students.size());
        map.put("totalHalls", hallRepo.count());
        map.put("totalFees", totalFees);
        map.put("pendingFees", pendingFees);

        map.put("activeStudents", activeStudents);
        map.put("leftStudents", leftStudents);
        map.put("monthlyFeeTotal", monthlyFees);

        return map;
    }
}