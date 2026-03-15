package com.airtasker.controller;

import com.airtasker.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload endpoints")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a single file")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = fileService.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/upload-multiple")
    @Operation(summary = "Upload multiple files")
    public ResponseEntity<Map<String, List<String>>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files) {
        List<String> urls = fileService.uploadFiles(files);
        return ResponseEntity.ok(Map.of("urls", urls));
    }
}
