package com.academicassistant.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;

/**
 * Storage Service interface providing abstraction over document file storage mechanisms.
 */
public interface StorageService {

    /**
     * Stores a multipart file upload and returns its relative or absolute reference path.
     *
     * @param file the multipart file to store
     * @return the unique key or file path referencing the stored document
     * @throws IOException if a file IO write error occurs
     */
    String store(MultipartFile file) throws IOException;

    /**
     * Loads a file resource path matching the stored reference filename.
     *
     * @param filepath the stored file reference path
     * @return the system path mapping of the file
     */
    Path load(String filepath);

    /**
     * Loads the stored file as a Spring Resource for download streaming.
     *
     * @param filepath the reference filepath
     * @return the resource stream
     */
    Resource loadAsResource(String filepath);

    /**
     * Deletes a stored file matching the reference.
     *
     * @param filepath the reference filepath to remove
     * @throws IOException if an IO deletion failure occurs
     */
    void delete(String filepath) throws IOException;
}
