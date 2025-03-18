
const csvParser = require("csv-parser");
const fastCsv = require("fast-csv");
const fs = require("fs");
const Assignment = require("../models/assignment");
const stripBomStream = require("strip-bom-stream");
const path = require("path");
const xlsx = require("xlsx");



const secretSantaController = {

    // function to read the csv files gets uploaded
    readCSV: async (filePath, isPreviousYear = false) => {
        return new Promise((resolve, reject) => {
            const data = [];

            fs.readFile(filePath, "utf8", (err, fileData) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return reject(err);
                }

                // **Remove BOM (ï»¿) if present**
                if (fileData.charCodeAt(0) === 0xFEFF) {
                    fileData = fileData.slice(1);
                }

                // **Write cleaned data back to file before processing**
                fs.writeFileSync(filePath, fileData, "utf8");

                fs.createReadStream(filePath)
                    .pipe(csvParser({
                        headers: isPreviousYear
                            ? ["Employee_Name", "Employee_EmailID", "Secret_Child_Name", "Secret_Child_EmailID"]
                            : ["Employee_Name", "Employee_EmailID"],
                        skipLines: 1,
                        mapHeaders: ({ header }) => header.trim(),
                    }))
                    .on("headers", (headers) => console.log("✅ Detected Headers:", headers))
                    .on("data", (row) => {
                        if (!row.Employee_Name || !row.Employee_EmailID) {
                            return;
                        }
                        data.push(row);
                    })
                    .on("end", () => resolve(data))
                    .on("error", (error) => reject(error));
            });
        });
    },

    convertExcelToCSV: async (filePath) =>{
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Read first sheet
        const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    
        const csvPath = filePath.replace(/\.(xlsx|xls)$/, ".csv"); // Convert filename to .csv
        fs.writeFileSync(csvPath, csvData, "utf8"); // Save as CSV
        return csvPath;
    },

    //function to shuffle the array of employees
    shuffleArray: (array) => array.sort(() => Math.random() - 0.5),

    //function to assign the secret santas to the employees
    assignSecretSantas: async (employees, pastAssignments) => {
        try {
            let pastPairs = new Map();
            let assignments = [];

            // Store previous year's assignments in a Map
            pastAssignments.forEach((entry) => {
                if (!entry || !entry.Employee_EmailID || !entry.Secret_Child_EmailID) {
                    return;
                }
                pastPairs.set(entry.Employee_EmailID.trim(), entry.Secret_Child_EmailID.trim());
            });

            let availableRecipients = [...employees];


            let maxRetries = 100; // Prevent infinite loops
            let attempts = 0;
            let success = false;

            while (attempts < maxRetries) {
                attempts++;
                assignments = [];
                availableRecipients = secretSantaController.shuffleArray([...employees]); // Shuffle to randomize assignment

                let valid = true;

                for (let employee of employees) {
                    let possibleRecipients = availableRecipients.filter(
                        (rec) =>
                            rec.Employee_EmailID !== employee.Employee_EmailID && // No self-assignment
                            rec.Employee_EmailID !== pastPairs.get(employee.Employee_EmailID) // No past repetition
                    );

                    if (possibleRecipients.length === 0) {
                        console.log(` No valid recipient found for ${employee.Employee_Name}. Retrying...`);
                        valid = false;
                        break; // Restart the process
                    }

                    let chosenRecipient = possibleRecipients[Math.floor(Math.random() * possibleRecipients.length)];

                    assignments.push({
                        Employee_Name: employee.Employee_Name,
                        Employee_EmailID: employee.Employee_EmailID,
                        Secret_Child_Name: chosenRecipient.Employee_Name,
                        Secret_Child_EmailID: chosenRecipient.Employee_EmailID,
                    });

                    // Remove chosen recipient from available list
                    availableRecipients = availableRecipients.filter(
                        (rec) => rec.Employee_EmailID !== chosenRecipient.Employee_EmailID
                    );
                }

                if (valid) {
                    success = true;
                    break; // Exit retry loop
                }
            }

            if (!success) {
                console.log("Could not generate a valid Secret Santa assignment after multiple attempts.");
                return null;
            }

            return assignments;
        } catch (error) {
            console.log("Error in assignSecretSantas:", error);
        }
    },

    //function to process the csv files uploaded
    processCSV: async (req, res) => {

        if (!req.files || !req.files.currentFile || !req.files.previousFile) {
            return res.status(400).json({ error: "Both current and previous year CSV files are required." });
        }

        try {
            let currentFilePath = req.files.currentFile[0].path;
            let previousFilePath = req.files.previousFile[0].path;
            if (req.files.currentFile[0].mimetype.includes("spreadsheetml")) {
                console.log("Converting Current Year Excel to CSV...");
                currentFilePath = await secretSantaController.convertExcelToCSV(currentFilePath);
            }
    
            if (req.files.previousFile[0].mimetype.includes("spreadsheetml")) {
                console.log("Converting Previous Year Excel to CSV...");
                previousFilePath = await secretSantaController.convertExcelToCSV(previousFilePath);
            }
            const currentEmployees = await secretSantaController.readCSV(currentFilePath);
            const pastAssignments = await secretSantaController.readCSV(previousFilePath);

            let assignments = await secretSantaController.assignSecretSantas(currentEmployees, pastAssignments);
            if (!assignments) {
                return res.status(400).json({ error: "Failed to assign Secret Santas. Try again." });
            }

            // Save assignments to MongoDB
            await Assignment.deleteMany();
            await Assignment.insertMany(assignments);

            // Save to CSV
            const outputPath = path.join(__dirname, "../uploads/output.csv");
            const ws = fs.createWriteStream(outputPath, { encoding: "utf8" });
            fastCsv
                .write(assignments, { headers: true, writeBOM: false })
                .pipe(ws)
                .on("finish", () => console.log("CSV file written successfully!"))
                .on("error", (err) => console.error("Error writing CSV:", err));

            res.json({ message: "Assignments generated successfully!", outputFile: "/api/download" });
        } catch (error) {
            console.error("Error processing CSV:", error);
            res.status(500).json({ error: "Server error while processing CSV files" });
        }
    },

    //function to download the new assigned secret santas file
    downloadCSV: async (req, res) => {

        res.download(path.join(__dirname, "../uploads/output.csv"));
    }
}

module.exports = secretSantaController;