import React, { useState, useEffect } from "react";
import { FaFolder, FaFile, FaTrash } from "react-icons/fa";
import { CiHardDrive } from "react-icons/ci";
import API from "../../api";
// import "bootstrap/dist/css/bootstrap.min.css";

const DriveManager = () => {
  const [driveName, setDriveName] = useState("");
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showCreateDriveModal, setShowCreateDriveModal] = useState(false);

  const fetchDrives = async () => {
    try {
      const response = await API.post("/api/drive/list", {});
      setDrives(response.data.drives);
      setError("");
    } catch {
      setError("Error fetching drives");
    }
  };

  const createDrive = async () => {
    if (!driveName) return;
    try {
      await API.post("/api/drive/create", { driveName });
      setDriveName("");
      fetchDrives();
      setSuccess("Drive created successfully.");
      setShowCreateDriveModal(false);
    } catch {
      setError("Error creating drive.");
    }
  };

  const viewDriveFiles = async (driveId) => {
    setSelectedDrive(driveId);
    try {
      const response = await API.post("/api/drive/files", { driveId });
      setFiles(response.data.files);
    } catch {
      setError("Error fetching files");
    }
  };

  const uploadFile = async () => {
    if (!file || !selectedDrive) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post(`/api/drive/upload?driveId=${selectedDrive}`, formData);
      viewDriveFiles(selectedDrive);
      setSuccess("File uploaded successfully.");
    } catch {
      setError("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const deleteDrive = async (driveId) => {
    try {
      await API.post("/api/drive/delete", { driveId });
      fetchDrives();
      setSuccess("Drive deleted successfully.");
    } catch {
      setError("Error deleting drive.");
    }
  };

  const downloadFile = async (filePath, fileName) => {
    try {
      const response = await API.post("/api/drive/download", { filePath }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Error downloading file.");
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-dark container py-4">
      <h1 className="text-center mb-4">Drive Manager</h1>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Create Drive Button */}
      <button className="btn btn-primary mb-3" onClick={() => setShowCreateDriveModal(true)}>
        Create Drive
      </button>

      {/* Create Drive Modal */}
      {showCreateDriveModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Drive</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateDriveModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Drive Name"
                  value={driveName}
                  onChange={(e) => setDriveName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateDriveModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={createDrive}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drives List */}
      {!selectedDrive && (
        <div className="row">
          {drives.map((drive) => (
            <div key={drive._id} className="col-md-3 mb-3">
              <div
                className="card text-center shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => viewDriveFiles(drive._id)}
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center">
                    <CiHardDrive 
                    className="text-danger me-2" size={32} />
                    <h5 className="card-title mb-0 text-truncate">{drive.driveName}</h5>
                  </div>
                  <div className="progress mt-3">
                    <div className="progress-bar bg-success" style={{ width: `${drive.usedSpace}%` }}>
                      {drive.usedSpace}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files Section */}
      {selectedDrive && (
        <>
          <button className="btn btn-secondary mb-3" onClick={() => setSelectedDrive(null)}>
            Back to Drives
          </button>

          {/* Search and Upload */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn btn-success" onClick={uploadFile} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>

          {/* Files List */}
          <ul className="list-group">
            {filteredFiles.map((file) => (
              <li key={file._id} className="list-group-item d-flex justify-content-between align-items-center">
                <FaFile className="text-primary me-2" />
                <span className="text-truncate flex-grow-1">{file.name}</span>
                <button className="btn btn-sm btn-primary me-2" onClick={() => downloadFile(file.path, file.name)}>
                  Download
                </button>
              </li>
            ))}
          </ul>

          {/* Delete Drive */}
          <button className="btn btn-danger mt-3" onClick={() => deleteDrive(selectedDrive)}>
            <FaTrash className="me-2" /> Delete Drive
          </button>
        </>
      )}
    </div>
  );
};

export default DriveManager;
