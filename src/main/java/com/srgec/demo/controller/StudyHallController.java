package com.srgec.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.srgec.demo.entity.StudyHall;
import com.srgec.demo.repository.StudyHallRepository;

@RestController
@RequestMapping("/api/study-halls")
@CrossOrigin(origins = "*")
public class StudyHallController {

    @Autowired
    private StudyHallRepository repo;

    @GetMapping
    public List<StudyHall> getAllStudyHalls() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public StudyHall getHall(@PathVariable Long id) {
        return repo.findById(id).orElse(null);
    }

    @PostMapping
    public StudyHall addHall(@RequestBody StudyHall hall) {
        return repo.save(hall);
    }

    @PutMapping("/{id}")
    public StudyHall updateHall(
            @PathVariable Long id,
            @RequestBody StudyHall updatedHall) {

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

    @DeleteMapping("/{id}")
    public String deleteHall(@PathVariable Long id) {

        repo.deleteById(id);

        return "Hall Deleted Successfully";
    }
}