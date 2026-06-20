package com.srgec.demo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;

@Service
public class FeeService {

    @Autowired
    private StudentRepository repo;

    public Map<String, String> calculateMonthlyFees() {

        List<Student> students = repo.findAll();

        for (Student s : students) {

            if (s.getLeftDate() == null) {

                Integer due = s.getFeeDue() == null ? 0 : s.getFeeDue();
                Integer monthly = s.getMonthlyFee() == null ? 0 : s.getMonthlyFee();

                s.setFeeDue(due + monthly);

                repo.save(s);
            }
        }

        Map<String, String> response = new HashMap<>();

        response.put("message", "Monthly Fees Calculated Successfully");

        return response;
    }

    public List<Student> getUpcomingFees() {
        return repo.findAll();
    }
}