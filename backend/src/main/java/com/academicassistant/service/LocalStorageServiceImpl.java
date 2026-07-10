package com.academicassistant.service;

import com.academicassistant.exception.BadRequestException;
import com.academicassistant.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local implementation of StorageService storing documents inside a configured folder in the local filesystem.
 */
@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public LocalStorageServiceImpl(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location: " + uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Cannot store file with relative path outside current directory " + originalFilename);
        }

        // Generate unique name to prevent collisions
        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex);
        }
        
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path targetLocation = this.rootLocation.resolve(storedFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative path from root location
        return storedFilename;
    }

    @Override
    public Path load(String filepath) {
        return this.rootLocation.resolve(filepath).normalize();
    }

    @Override
    public Resource loadAsResource(String filepath) {
        try {
            Path file = load(filepath);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read file: " + filepath);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Could not read file: " + filepath, e);
        }
    }

    @Override
    public void delete(String filepath) throws IOException {
        Path file = load(filepath);
        Files.deleteIfExists(file);
    }
}
