import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Results = () => {
  const [results, setResults] = useState([]); // Store results in an array
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await API.get("/user/results"); // Fetch user results
        console.log(response.data);
        setResults(response.data); // Set the results data
      } catch (err) {
        if (err.response?.status === 401) {
          console.error("Unauthorized: Redirecting to login");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "An error occurred");
        }
      }
    };

    fetchResults();
  }, [navigate]);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!results.length) {
    return (
      <div>
        <h3>Results</h3>
        <p>No results to display currently.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>User Results</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks Obtained</th>
            <th>Total Marks</th>
            <th>Grade</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result._id}>
              <td>{result.subject}</td>
              <td>{result.marksObtained}</td>
              <td>{result.totalMarks}</td>
              <td>{result.grade || "N/A"}</td>
              <td>{new Date(result.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
