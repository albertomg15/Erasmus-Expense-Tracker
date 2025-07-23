package com.eet.backend.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDto {
    private UUID categoryId;
    private String name;
    private String emoji;
    private boolean isDefault;
}

