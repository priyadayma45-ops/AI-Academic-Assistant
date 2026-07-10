import api from './api';

const documentService = {
  /**
   * Uploads assignment file to the server.
   *
   * @param {File} file the file object
   * @param {Function} onUploadProgress progress callback
   */
  uploadDocument: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Fetches dashboard statistics summary and recent uploads list.
   */
  getDashboardStats: async () => {
    const response = await api.get('/api/v1/documents/stats');
    return response.data;
  },

  /**
   * Retrieves paginated document records.
   */
  listDocuments: async (page = 0, size = 10) => {
    const response = await api.get(`/api/v1/documents?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Retrieves details of a specific assignment document.
   */
  getDocumentDetails: async (id) => {
    const response = await api.get(`/api/v1/documents/${id}`);
    return response.data;
  },

  /**
   * Downloads a document file attachment.
   */
  downloadDocument: async (id, filename) => {
    const response = await api.get(`/api/v1/documents/${id}/download`, {
      responseType: 'blob',
    });
    
    // Create download link anchor
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default documentService;
