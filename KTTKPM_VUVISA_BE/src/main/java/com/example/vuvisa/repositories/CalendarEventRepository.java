package com.example.vuvisa.repositories;

import com.example.vuvisa.entities.CalendarEvent;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.EventPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    /**
     * Find upcoming calendar events within a specific time range
     * 
     * @param startTime the start of the time range
     * @param endTime the end of the time range
     * @return list of upcoming calendar events
     */
    @Query("SELECT e FROM CalendarEvent e WHERE e.startTime BETWEEN :startTime AND :endTime ORDER BY e.startTime ASC")
    List<CalendarEvent> findUpcomingEvents(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * Find calendar events created after a specific time
     * 
     * @param createdAt the time after which events were created
     * @return list of calendar events
     */
    List<CalendarEvent> findByCreatedAtAfter(LocalDateTime createdAt);

    /**
     * Find calendar events by creator
     * 
     * @param user the creator
     * @return list of calendar events
     */
    List<CalendarEvent> findByCreatedBy(User user);
}
