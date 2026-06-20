package com.srgec.demo.controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private StudentRepository repo;

    @GetMapping("/fee-collection")
    public List<Map<String, Object>> feeCollectionReport() {

        List<Student> students = repo.findAll();

        Map<String, Map<String, Object>> hallData =
                new HashMap<>();

        for (Student s : students) {

            String hall = s.getHall();

            hallData.putIfAbsent(
                    hall,
                    new HashMap<>());

            Map<String, Object> data =
                    hallData.get(hall);

            data.put(
                    "hall",
                    hall);

            data.put(
                    "totalStudents",
                    (Integer) data.getOrDefault(
                            "totalStudents",
                            0) + 1);

            data.put(
                    "feesCollected",
                    (Integer) data.getOrDefault(
                            "feesCollected",
                            0) + s.getFeePaid());

            data.put(
                    "feesPending",
                    (Integer) data.getOrDefault(
                            "feesPending",
                            0) + s.getFeeDue());
        }

        return new ArrayList<>(hallData.values());
    }
}