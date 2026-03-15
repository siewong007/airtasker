package com.airtasker.config;

import com.airtasker.model.Category;
import com.airtasker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            initializeCategories();
        }
    }

    private void initializeCategories() {
        List<Category> categories = Arrays.asList(
                createCategory("Cleaning", "Home and office cleaning services", "cleaning", "🧹", 1),
                createCategory("Handyman", "General repairs and maintenance", "handyman", "🔧", 2),
                createCategory("Moving", "Moving and packing services", "moving", "📦", 3),
                createCategory("Delivery", "Pickup and delivery services", "delivery", "🚚", 4),
                createCategory("Gardening", "Lawn care and gardening", "gardening", "🌱", 5),
                createCategory("Assembly", "Furniture and equipment assembly", "assembly", "🪑", 6),
                createCategory("Photography", "Photography and videography", "photography", "📸", 7),
                createCategory("Tech Support", "Computer and tech assistance", "tech-support", "💻", 8),
                createCategory("Tutoring", "Teaching and tutoring services", "tutoring", "📚", 9),
                createCategory("Pet Care", "Pet sitting and walking", "pet-care", "🐕", 10),
                createCategory("Cooking", "Personal chef and meal prep", "cooking", "👨‍🍳", 11),
                createCategory("Admin", "Administrative and data entry tasks", "admin", "📋", 12),
                createCategory("Events", "Event planning and assistance", "events", "🎉", 13),
                createCategory("Auto", "Automotive services", "auto", "🚗", 14),
                createCategory("Other", "Miscellaneous tasks", "other", "✨", 15)
        );

        categoryRepository.saveAll(categories);
    }

    private Category createCategory(String name, String description, String slug, String icon, int order) {
        return Category.builder()
                .name(name)
                .description(description)
                .slug(slug)
                .icon(icon)
                .sortOrder(order)
                .active(true)
                .build();
    }
}
