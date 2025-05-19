# Patient Registration App

A frontend-only patient registration application built with React and PGlite for data storage. This application allows users to register new patients, query records using raw SQL, and persists patient data across page refreshes and multiple browser tabs.

## Live Demo

View the live application at: [https://patient-registration-pglite-pa1c.vercel.app](https://patient-registration-pglite-pa1c.vercel.app)

## Features

- **Patient Registration**: Add new patients with form validation
- **Patient Management**: View, edit, and delete patient records
- **Data Persistence**: All data is stored locally in the browser using PGlite
- **Multi-tab Synchronization**: Changes made in one tab are reflected in all open tabs
- **SQL Query Console**: Execute raw SQL queries against the patient database

## Technology Stack

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS for styling
- **Database**: PGlite for SQL database
- **State Management**: React Context API with custom hooks

## Setup Instructions

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HumptyDumpty101/patient-registration-pglite.git
   cd patient-registration-pglite
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be generated in the `dist` directory and can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Usage

### Patient Registration

1. Navigate to the "Register" page
2. Fill in the required patient information (first name, last name, date of birth, gender)
3. Add optional details like contact number, email, address, and medical history
4. Submit the form to register the patient

### Viewing and Managing Patients

1. The home page displays all registered patients
2. Click on any patient to view their details
3. In the detail view, you can edit or delete the patient record

### Using the SQL Query Console

1. Navigate to the "SQL Query" page
2. Enter SQL queries to interact with the patient database
3. For parameterized queries, use `$1`, `$2`, etc. as placeholders
4. Enter parameters as comma-separated values or as a JSON array
5. Click "Execute Query" to run the query and view results

Example queries:
- `SELECT * FROM patients` - View all patients
- `SELECT * FROM patients WHERE gender = $1` with parameter `Male` - View all male patients
- `UPDATE patients SET email = $1 WHERE id = $2` with parameters `newemail@example.com, 1` - Update a patient's email

## Database Schema

The application uses a simple schema with a single `patients` table:

```sql
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  contact_number TEXT UNIQUE,
  email TEXT UNIQUE,
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### PGlite Integration

The application uses PGlite, a WebAssembly-based PostgreSQL implementation that runs entirely in the browser. This allows for a fully functional SQL database without requiring a backend server.

Key implementation aspects:
- Database initialization in a Web Worker for better performance
- Live queries with PGlite's `live` extension for reactive data updates
- Leader-follower model for synchronizing data across multiple tabs

### Multi-tab Synchronization

The application implements multi-tab synchronization using PGlite's built-in capabilities:
- One tab acts as the "leader" and handles write operations
- Other tabs are "followers" that subscribe to changes
- When changes occur, all tabs are automatically updated

### Form Validation

The application implements form validation:
- Required fields (first name, last name, date of birth, gender)
- Format validation for email and phone numbers
- Uniqueness checks for email and contact number
- Immediate feedback with inline error messages

## Challenges Faced During Development

### 1. PGlite Integration

**Challenge**: Integrating PGlite with React and setting up a stable database connection that works across multiple tabs.

**Solution**: Implemented a custom Context Provider (`PGliteContext`) that initializes the database in a Web Worker and provides a consistent API for database operations throughout the application. Used effect hooks to manage database lifecycle.

### 2. Real-time Data Synchronization

**Challenge**: Ensuring that changes made in one tab are immediately reflected in all open tabs without requiring manual refreshes.

**Solution**: Leveraged PGlite's `live` extension to create reactive queries that automatically update when the underlying data changes. Implemented a leader-follower model where one tab is designated as the leader for write operations, ensuring data consistency.

### 3. Comprehensive Form Validation

**Challenge**: Implementing robust form validation that provides immediate feedback and prevents duplicate entries.

**Solution**: Created a custom validation utility that handles both basic validation (required fields, format checks) and advanced validation (uniqueness constraints). Used React's state and effect hooks to provide real-time validation feedback as users type.

### 4. SQL Query Console Implementation

**Challenge**: Building a flexible SQL console that supports both simple and parameterized queries with proper error handling.

**Solution**: Developed a query console component that parses and executes SQL queries, handles parameters in various formats (comma-separated values or JSON arrays), and displays results in a tabular format. Added error handling to provide clear feedback when queries fail.


## Author

Rohith K S  (A.K.A HumptyDumpty101)

## Remarks

A big thanks to pglite team for their awesome documentation and Medblocks interview team for giving me this task, which enabled me to learn more about the ppglite.
