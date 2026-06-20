package com.srgec.demo.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository repo;

    @GetMapping
    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Student getStudent(@PathVariable Long id) {
        return repo.findById(id).orElse(null);
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {

        if (student.getStatus() == null) {
            student.setStatus("Pending");
        }

        return repo.save(student);
    }

    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @RequestBody Student updatedStudent) {

        Optional<Student> optional = repo.findById(id);

        if (optional.isPresent()) {

            Student student = optional.get();

            student.setName(updatedStudent.getName());
            student.setCabin(updatedStudent.getCabin());
            student.setHall(updatedStudent.getHall());
            student.setPhone(updatedStudent.getPhone());

            student.setJoinDate(updatedStudent.getJoinDate());
            student.setLeftDate(updatedStudent.getLeftDate());

            student.setMonthlyFee(updatedStudent.getMonthlyFee());
            student.setFeePaid(updatedStudent.getFeePaid());
            student.setFeeDue(updatedStudent.getFeeDue());
            student.setStatus(updatedStudent.getStatus());

            return repo.save(student);
        }

        return null;
    }

    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {

        repo.deleteById(id);

        return "Student Deleted Successfully";
    }

    @PutMapping("/{id}/leave")
    public Student markAsLeft(@PathVariable Long id) {

        Student student = repo.findById(id).orElse(null);

        if (student != null) {

            student.setLeftDate(LocalDate.now());
            student.setStatus("Left");

            return repo.save(student);
        }

        return null;
    }

    @PutMapping("/{id}/reactivate")
    public Student reactivateStudent(@PathVariable Long id) {

        Student student = repo.findById(id).orElse(null);

        if (student != null) {

            student.setLeftDate(null);
            student.setStatus("Paid");

            return repo.save(student);
        }

        return null;
    }

    @GetMapping("/recent")
    public List<Student> recentStudents() {

        List<Student> students = repo.findAll();

        int size = students.size();

        if (size <= 5) {
            return students;
        }

        return students.subList(size - 5, size);
    }
}