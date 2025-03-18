const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    employeeName: String,
    employeeEmail: String,
    secretChildName: String,
    secretChildEmail: String,
});

module.exports = mongoose.model("Assignment", assignmentSchema);
