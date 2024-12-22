const preprocessUpdatesForEmail = (updates, version) => {  const emailContent = `
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              padding: 20px;
            }
            .email-container {
              max-width: 600px;
              margin: auto;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
              padding: 20px;
            }
            .email-header {
              color: #343a40;
              text-align: center;
              margin-bottom: 20px;
            }
            .email-footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #6c757d;
            }
            .badge-remove {
              background-color: #dc3545; /* Red */
            }
            .badge-add {
              background-color: #28a745; /* Green */
            }
            .badge-update {
              background-color: #17a2b8; /* Teal */
            }
            .badge-default {
              background-color: #6c757d; /* Gray */
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h2 class="email-header">New Version Updated ${version}</h2>
              <ul class="list-group">
              ${updates
                .map(
                  (update) => `
                  <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                      <div class="fw-bold ${update.type === "remove" ? "text-danger" : "text-primary"}">
                        ${update.message}
                      </div>
                    </div>
                  </li>
                `
                )
                .join("")}
            </ul>
            <p class="email-footer">
              Thank you for staying updated!
            </p>
          </div>
        </body>
      </html>
    `;
  return emailContent;
};

// Helper function to style badges based on update type
const getBadgeClass = (type) => {
  switch (type.toLowerCase()) {
    case "add":
      return "badge-add";
    case "remove":
      return "badge-remove";
    case "update":
      return "badge-update";
    default:
      return "badge-default";
  }
};

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = preprocessUpdatesForEmail;
