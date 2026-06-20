package com.srgec.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.srgec.demo.entity.StudyHall;
import com.srgec.demo.repository.StudyHallRepository;

@Service
public class StudyHallService {

    @Autowired
    private StudyHallRepository repo;

    public List<StudyHall> getAllHalls() {
        return repo.findAll();
    }

    public StudyHall getHall(Long id) {
        return repo.findById(id).orElse(null);
    }

    public StudyHall saveHall(StudyHall hall) {
        return repo.save(hall);
    }

    public StudyHall updateHall(Long id, StudyHall updatedHall) {

        StudyHall hall = repo.findById(id).orElse(null);

        if (hall != null) {

            hall.setName(updatedHall.getName());
            hall.setCapacity(updatedHall.getCapacity());
            hall.setLocation(updatedHall.getLocation());
            hall.setDescription(updatedHall.getDescription());

            return repo.save(hall);
        }

        return null;
    }

    public void deleteHall(Long id) {
        repo.deleteById(id);
    }
}