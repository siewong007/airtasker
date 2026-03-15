package com.airtasker.repository;

import com.airtasker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.rating >= :minRating ORDER BY u.rating DESC")
    List<User> findTopRatedUsers(Double minRating);

    @Query("SELECT u FROM User u WHERE u.location LIKE %:location%")
    List<User> findByLocationContaining(String location);

    List<User> findByActiveTrue();
}
