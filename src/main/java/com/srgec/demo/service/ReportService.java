package com.srgec.demo.service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;

@Service
public class ReportService {

    @Autowired
    private StudentRepository repo;

    public List<Map<String, Object>> feeCollectionReport() {

        List<Student> students = repo.findAll();

        Map<String, Map<String, Object>> hallReport =
                new HashMap<>();

        for (Student s : students) {

            String hall = s.getHall();

            hallReport.putIfAbsent(
                    hall,
                    new HashMap<>());

            Map<String, Object> data =
                    hallReport.get(hall);

            data.put("hall", hall);

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

            double collected =
                    (Integer) data.get("feesCollected");

            double pending =
                    (Integer) data.get("feesPending");

            double rate =
                    (collected + pending) == 0
                            ? 0
                            : (collected * 100)
                            / (collected + pending);

            data.put(
                    "collectionRate",
                    String.format("%.2f%%", rate));
        }

        return new ArrayList<>(hallReport.values());
    }
}