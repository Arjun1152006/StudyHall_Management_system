package com.srgec.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.srgec.demo.entity.StudyHall;

public interface StudyHallRepository extends JpaRepository<StudyHall, Long> {
}