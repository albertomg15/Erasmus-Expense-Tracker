package com.eet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class TagDto {
    private UUID tagId;
    private String name;
}
