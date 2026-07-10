import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardBody } from '../../components/Card';
import Button from '../../components/Button';
import documentService from '../../services/documentService';
import { 
  Upload, FileText, CheckCircle, Clock, AlertTriangle, 
  Award, TrendingUp, Sparkles, RefreshCw, Download, FileSpreadsheet, Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Dashboard states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const fileInputRef = useRef(null);

  // Load stats
  const fetchStats = async (silent = false) => {
    if (!silent) setLoadingStats(true);
    try {
      const res = await documentService.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to load dashboard metrics');
    } finally {
      if (!silent) setLoadingStats(false);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-polling for active background grading
  useEffect(() => {
    if (!stats || !stats.recentDocuments) return;

    const hasActiveAnalysis = stats.recentDocuments.some(
      (doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING'
    );

    if (hasActiveAnalysis) {
      const interval = setInterval(() => {
        logPollingStatus();
        fetchStats(true); // Silent update in background
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [stats]);

  const logPollingStatus = () => {
    console.log("Polling background grading status...");
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  // Upload trigger
  const handleFileUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await documentService.uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (res.success) {
        addToast('success', res.message || 'File uploaded successfully! Analysis has started.');
        fetchStats(true);
      }
    } catch (err) {
      console.error(err);
      addToast('error', err.message || 'File upload failed. Ensure the format is supported.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Trigger input selection
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Download action
  const handleDownload = async (docId, filename) => {
    try {
      addToast('info', `Downloading ${filename}...`);
      await documentService.downloadDocument(docId, filename);
    } catch (err) {
      console.error(err);
      addToast('error', 'Download failed. File may no longer exist.');
    }
  };

  // Helper formatting values
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" /> PENDING
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1.5 w-fit animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> PROCESSING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center gap-1.5 w-fit">
            <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1.5 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" /> FAILED
          </span>
        );
      default:
        return null;
    }
  };

  // Chart configuration
  const completedDocs = stats?.recentDocuments
    ? [...stats.recentDocuments].filter((d) => d.status === 'COMPLETED' && d.score !== null).reverse()
    : [];

  const chartData = {
    labels: completedDocs.map((d) => d.filename.substring(0, 12) + (d.filename.length > 12 ? '...' : '')),
    datasets: [
      {
        fill: true,
        label: 'Assignment Score',
        data: completedDocs.map((d) => d.score),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.7)',
          font: { size: 10 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.7)',
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top welcome layout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Student Dashboard <Sparkles className="w-5 h-5 text-brand-500" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload your assignments for instant AI grading and grammar audits.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => fetchStats()}
            disabled={loadingStats}
            aria-label="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardBody className="flex items-center gap-4 p-5">
              <div className="p-3 bg-brand-500/10 text-brand-500 dark:text-brand-400 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Uploads</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  {loadingStats ? '...' : stats?.totalAssignments || 0}
                </h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 p-5">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Grade</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  {loadingStats ? '...' : stats?.averageScore ? `${stats.averageScore}%` : 'N/A'}
                </h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 p-5">
              <div className="p-3 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Analysis</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  {loadingStats ? '...' : stats?.pendingAssignments || 0}
                </h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 p-5">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-2xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Checks</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                  {loadingStats ? '...' : stats?.completedAssignments || 0}
                </h3>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Upload Dropzone & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="h-full">
              <CardBody className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload Assignment</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Drop your document here. Supported file types: PDF, DOCX, DOC, TXT, PNG, JPG, JPEG (Max 15MB).
                  </p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden h-64 ${
                    dragActive
                      ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 scale-[0.99]'
                      : 'border-slate-200 dark:border-darkbg-border hover:border-brand-500/55 dark:hover:border-brand-500/40 bg-slate-50/50 dark:bg-darkbg-card'
                  }`}
                  onClick={handleButtonClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleButtonClick(); }}
                  aria-label="Upload document dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                  />

                  <AnimatePresence mode="wait">
                    {uploading ? (
                      <motion.div
                        key="uploading-progress"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full flex flex-col items-center px-4"
                      >
                        <RefreshCw className="w-12 h-12 text-brand-500 animate-spin mb-4" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-2">Uploading File...</p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner max-w-[200px]">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 mt-2 font-semibold">{uploadProgress}%</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dropzone-prompt"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="p-4 bg-slate-100 dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border text-slate-400 rounded-full mb-4 shadow-sm hover:scale-105 transition-transform">
                          <Upload className="w-8 h-8 text-brand-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Drag & Drop or <span className="text-brand-500">Browse</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Accepts document or image file types</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Performance chart */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardBody className="p-6 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" /> Performance Trend
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    Visualizes grades scores over recently completed assignment evaluations.
                  </p>
                </div>

                <div className="h-64 relative flex items-center justify-center">
                  {loadingStats ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
                      <span className="text-xs">Computing chart...</span>
                    </div>
                  ) : completedDocs.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 text-center px-6">
                      <TrendingUp className="w-12 h-12 stroke-[1.5]" />
                      <div>
                        <p className="text-sm font-semibold">No performance data yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                          Complete check audits will dynamically populate statistics charts.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Recent Uploads Table */}
        <Card>
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Uploads</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track the progress, grades, and download documents check records.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-darkbg-border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-darkbg-card border-b border-slate-100 dark:border-darkbg-border">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Filename</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Upload Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">File Size</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Score</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkbg-border text-sm">
                  {loadingStats ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
                        Loading list...
                      </td>
                    </tr>
                  ) : stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
                    stats.recentDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-darkbg-card/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.filename)}
                            <span className="truncate max-w-[200px]" title={doc.filename}>{doc.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {formatBytes(doc.fileSize)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                          {doc.score !== null ? (
                            <span className={doc.score >= 80 ? 'text-emerald-500' : doc.score >= 50 ? 'text-amber-500' : 'text-red-500'}>
                              {doc.score}%
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDownload(doc.id, doc.filename)}
                            className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-darkbg-card rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Download original file"
                            aria-label={`Download ${doc.filename}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 stroke-[1.5] mx-auto mb-2 text-slate-300" />
                        No assignments uploaded yet. Try dropping a file above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Helper for file type icons
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return <FileText className="w-5 h-5 text-red-500" />;
  } else if (ext === 'docx' || ext === 'doc') {
    return <FileText className="w-5 h-5 text-blue-500" />;
  } else if (ext === 'xlsx' || ext === 'xls') {
    return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
  } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
    return <Image className="w-5 h-5 text-purple-500" />;
  }
  return <FileText className="w-5 h-5 text-slate-400" />;
};

export default StudentDashboard;
