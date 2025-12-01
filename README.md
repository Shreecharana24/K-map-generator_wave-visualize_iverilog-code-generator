# K-Map Visualizer & Boolean Expression Solver

A full-stack tool that solves Boolean expressions, generates truth tables, simplifies them using Karnaugh Maps (K-maps), and auto-generates Verilog code with simulation results.

## 🚀 Project Overview

This project is divided into two parts:
- **Backend (Flask):** Handles expression parsing, K-map logic, and Verilog simulation.
- **Frontend (HTML/JS):** A clean UI to interact with the API and visualize results.

## 📂 Project Structure

    kmap-visualizer/
    │
    ├── backend/
    │   ├── app.py              # Main Flask application
    │   ├── kmap_utils.py       # Logic for K-Map simplification
    │   ├── verilog_runner.py   # Handles Icarus Verilog simulation
    │   └── requirements.txt    # Python dependencies
    │
    ├── frontend/
    │   ├── index.html          # Main user interface
    │   ├── script.js           # API calls and DOM manipulation
    │   └── styles.css          # Styling
    │
    └── .gitignore

## ✨ Features

### Backend (Flask)
- Parse and evaluate Boolean expressions.
- Generate truth tables.
- Generate K-maps and simplified Boolean expressions.
- Auto-generate Verilog code.
- Simulate Verilog output using **Icarus Verilog**.
- Return waveform data and simulation results.

### Frontend
- Input field for Boolean expressions.
- Display generated truth tables.
- Visualize simplified results from K-map.
- Show generated Verilog code.
- Display simulation output logs.

---

## 🔧 Backend Setup

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Create and activate virtual environment (Optional)
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```
**Linux / macOS:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Install Icarus Verilog (Required for simulation)

- **Ubuntu/Linux:**
  ```bash
  sudo apt install iverilog
  ```

- **Windows:**
  1. Download from: [bleyer.org/icarus/](https://bleyer.org/icarus/)
  2. Add the executable path to your System Environment Variables (PATH):
     `C:\iverilog\bin`

### 5. Run the backend server
```bash
python app.py
```
*Server will start at: `http://localhost:5000`*

---

## 🖥️ Frontend Setup

Since this is a static frontend, you can technically just open `frontend/index.html` in your browser.

**However**, if your browser blocks API calls due to **CORS policy**, run a local server:

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start a simple Python server:
   ```bash
   python -m http.server 3000
   ```
3. Open in browser:
   `http://localhost:3000`

---

## 📡 API Endpoints

### 1. Generate Truth Table
`POST /generate_truth_table`

**Request Body:**
```json
{
  "expression": "A'B + AB'"
}
```

### 2. Generate K-Map & Simplification
`POST /generate_kmap`

**Request Body:**
```json
{
  "expression": "A + BC'"
}
```

### 3. Generate & Simulate Verilog
`POST /generate_verilog`

**Request Body:**
```json
{
  "expression": "(A + B)'C"
}
```

## 📝 Supported Expression Examples

You can try inputs like:
- `A + B'`
- `AB + A'C`
- `(A + B)(C' + D)`
- `A ^ B` (XOR)
- `A'BC + AB'C`
