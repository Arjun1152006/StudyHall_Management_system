package com.srgec.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FeeController {

    @Autowired
    private StudentRepository repo;

    @PostMapping("/fees/calculate-monthly")
    public Map<String, String> calculateFees() {

        List<Student> students = repo.findAll();

        for (Student s : students) {

            if (s.getLeftDate() == null) {

                s.setFeeDue(
                        s.getFeeDue() + s.getMonthlyFee());

                repo.save(s);
            }
        }

        Map<String, String> map = new HashMap<>();
        map.put("message", "Monthly Fees Calculated");

        return map;
    }

    @GetMapping("/upcoming-fees")
    public List<Student> upcomingFees() {
        return repo.findAll();
    }
}