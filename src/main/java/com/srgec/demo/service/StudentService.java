package com.srgec.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.srgec.demo.entity.Student;
import com.srgec.demo.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    public Student getStudent(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Student saveStudent(Student student) {

        if (student.getStatus() == null) {
            student.setStatus("Pending");
        }

        return repo.save(student);
    }

    public Student updateStudent(Long id, Student updatedStudent) {

        Student student = repo.findById(id).orElse(null);

        if (student != null) {

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

    public void deleteStudent(Long id) {
        repo.deleteById(id);
    }

    public Student markAsLeft(Long id) {

        Student student = repo.findById(id).orElse(null);

        if (student != null) {

            student.setLeftDate(LocalDate.now());
            student.setStatus("Left");

            return repo.save(student);
        }

        return null;
    }

    public Student reactivate(Long id) {

        Student student = repo.findById(id).orElse(null);

        if (student != null) {

            student.setLeftDate(null);
            student.setStatus("Paid");

            return repo.save(student);
        }

        return null;
    }

    public List<Student> getRecentStudents() {

        List<Student> students = repo.findAll();

        int size = students.size();

        if (size <= 5) {
            return students;
        }

        return students.subList(size - 5, size);
    }
}