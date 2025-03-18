# Secret Santa Shuffle

A full-stack Secret Santa application that allows users to upload employee lists, generate assignments, and download results, ensuring the following rules:

- An employee **cannot choose themselves** as their Secret Santa.
- An employee **cannot be assigned the same secret child** as the previous year.
- Each employee **must have exactly one secret child** and vice versa.
- Supports **CSV and Excel (.xlsx) uploads**, with automatic Excel-to-CSV conversion.

## Features

- **File Upload** (Current Year & Previous Year Assignments)  
- **CSV & Excel (.xlsx) Support** (Converts Excel to CSV Automatically)  
- **Secret Santa Assignment** (No Repetitions, No Self-Assignments)  
- **Downloadable CSV File** of Final Assignments  
- **Frontend Validation** (Ensuring Files Are Uploaded Before Downloading)  

## Tech Stack

### **Frontend**
- HTML, CSS, JavaScript  
- Fetch API (for API Requests)  

### **Backend**
- Node.js, Express.js  
- Multer (File Uploads)  
- fast-csv (CSV Processing)  
- xlsx (Excel to CSV Conversion)  
- MongoDB (Optional, for Storing Assignments)  

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js**  
- **npm** (Comes with Node.js)  
- **Git**  
## Installation

### Clone the Repository  
```sh
git clone https://github.com/Monika-Thiyagarajan/task-manager.git
cd task-manager
