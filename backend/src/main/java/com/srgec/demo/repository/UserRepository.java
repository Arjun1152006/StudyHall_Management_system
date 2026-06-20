package com.srgec.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.srgec.demo.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username);
}