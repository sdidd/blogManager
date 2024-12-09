import React, { useState, useEffect } from "react";import API from "../../api";
import ReactImageZoom from "react-image-zooom";

const BASE_URL = "http://localhost:4000"; // your backend URL

const ImageUploader = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the uploaded image URLs when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await API.get("/api/image/images");
        setImageUrls(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch images:", error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await API.post("/api/image/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrls([...imageUrls, response.data.imageUrl]);
      setImageFile(null); // Clear the file input
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Image Upload and Preview</h1>

      <div className="row mb-4">
        <div className="col">
          <input type="file" onChange={handleFileChange} className="form-control" />
        </div>
        <div className="col">
          <button onClick={handleUpload} className="btn btn-primary">
            Upload
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {imageUrls.map((url, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card">
                {/* Image preview */}
                <img
                  src={`${BASE_URL}${url}`}
                  alt={`image-${index}`}
                  className="card-img-top"
                  data-bs-toggle="modal"
                  data-bs-target={`#imageModal-${index}`}
                />
                {/* Modal for full image */}
                <div
                  className="modal fade"
                  id={`imageModal-${index}`}
                  tabIndex="-1"
                  aria-labelledby={`imageModalLabel-${index}`}
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id={`imageModalLabel-${index}`}>
                          Full Image
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                      </div>
                      <div className="modal-body">
                        {/* Make the image bigger inside the modal */}
                        {/* <img
                          src={`${BASE_URL}${url}`}
                          alt={`Full Image-${index}`}
                          className="w-100" // Ensure the image fills the width of the modal
                          style={{ maxHeight: "100vh", objectFit: "contain" }} // Control the height and maintain aspect ratio
                        /> */}
                        <ReactImageZoom
                          src={`${BASE_URL}${url}`}
                          alt={`Full Image-${index}`}
                          className="w-100" // Ensure the image fills the width of the modal
                          style={{ maxHeight: "100vh", objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
