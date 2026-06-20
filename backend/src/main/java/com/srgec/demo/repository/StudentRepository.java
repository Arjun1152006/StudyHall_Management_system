package com.srgec.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.srgec.demo.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
}