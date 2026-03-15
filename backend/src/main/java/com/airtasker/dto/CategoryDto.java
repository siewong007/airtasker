package com.airtasker.dto;

import com.airtasker.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String slug;
    private String imageUrl;
    private Long parentId;
    private List<CategoryDto> subcategories;

    public static CategoryDto fromEntity(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .slug(category.getSlug())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .subcategories(category.getSubcategories() != null ?
                        category.getSubcategories().stream()
                                .map(CategoryDto::fromEntity)
                                .collect(Collectors.toList()) : null)
                .build();
    }
}
