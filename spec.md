# EduTrack SMS+RPS

## Current State

Full-stack school management system with four portals (Super Admin, School Admin, Teacher, Student). The Student portal shows results with school branding, grading table, stamp/signature footer. The School Admin portal has a Students page for adding/editing/deleting students one at a time.

## Requested Changes (Diff)

### Add
- **PDF Report Card Download**: A "Download Report Card" button on the Student Dashboard (`src/frontend/src/pages/student/Dashboard.tsx`) that generates and downloads a PDF using jsPDF + jspdf-autotable. The PDF should include: school logo (if available), school name (student's displayName context), motto, grading period info, the results table (Subject, CA1, CA2, Exam, Total, Grade), total/average, stamp and signature images (if available), and the grading scale.
- **Bulk CSV Student Upload**: An "Upload CSV" button on the School Admin Students page (`src/frontend/src/pages/admin/Students.tsx`) that opens a dialog for uploading a CSV file. CSV columns: fullName, gender, classId (or className for user-friendliness), admissionNumber, parentName, parentPhone, password. Parse client-side, show a preview table of rows to be imported, then submit each student via the existing `actor.addStudent()` API call. Show progress/results (success count, error rows).

### Modify
- `src/frontend/src/pages/student/Dashboard.tsx` — add PDF download button and jsPDF generation logic
- `src/frontend/src/pages/admin/Students.tsx` — add CSV upload button, dialog, parser, and bulk import logic
- `src/frontend/package.json` — add `jspdf` and `jspdf-autotable` dependencies

### Remove
- Nothing

## Implementation Plan

1. Install `jspdf` and `jspdf-autotable` npm packages in the frontend
2. On Student Dashboard: add a Download button that calls a `downloadReportCard()` function. This function builds the PDF: header with logo image, school info, results table via autoTable, footer with stamp/signature images, grading scale.
3. On Admin Students page: add "Upload CSV" button next to "Add Student". Opens a dialog with a file input, parses the CSV, shows a preview table, and on confirm calls `actor.addStudent()` for each row sequentially, showing a progress indicator and final summary.
4. CSV column mapping: fullName, gender, className (matched to class list), admissionNumber, parentName, parentPhone, password. Unknown class names should flag errors in preview.
