# K-Map Visualizer & Boolean Expression Solver

A full-stack tool that solves Boolean expressions, generates truth tables, simplifies them using Karnaugh Maps (K-maps), and auto-generates Verilog code with simulation results.

## This project contains:

A Flask backend for expression solving, K-map simplification, and Verilog simulation  
A Frontend UI (HTML, CSS, JS) to interact with the API

## Project Structure
kmap-visualizer/  
│  
├── backend/  
│   ├── app.py  
│   ├── kmap_utils.py  
│   ├── verilog_runner.py  
│   ├── requirements.txt  
│  
├── frontend/  
│   ├── index.html  
│   ├── script.js  
│   ├── styles.css  
│  
└── .gitignore  

## Features
### Backend (Flask)

Parse and evaluate Boolean expressions  
Generate truth tables  
Generate K-maps  
Produce simplified Boolean expressions  
Auto-generate Verilog code  
Simulate Verilog output using Icarus Verilog  
Return waveform data and simulation results

### Frontend

Input Boolean expressions  
Display truth table  
Display simplified result from K-map  
Show generated Verilog code  
Show simulation output

## Backend Setup
1. Navigate to backend folder  
cd backend

2. Create and activate virtual environment (optional)  
python -m venv venv  
venv\Scripts\activate        # Windows  
source venv/bin/activate     # Linux / macOS

3. Install dependencies  
pip install -r requirements.txt

4. Install Icarus Verilog (required for simulation)  

#### Ubuntu/Linux  

sudo apt install iverilog  


#### Windows  
Download from: 
https://bleyer.org/icarus/  

Add to PATH:  

C:\iverilog\bin

5. Run the backend server  
python app.py


Server will start at: 
http://localhost:5000

## Frontend Setup

Simply open:

frontend/index.html


If the browser blocks API calls (CORS), run a local server:

cd frontend  
python -m http.server 3000


Then open:

http://localhost:3000

## API Endpoints  
POST /generate_truth_table  
Generate truth table.  
Request:  
{  
  "expression": "A'B + AB'"  
}  

POST /generate_kmap  
Generate K-map and simplified expression.  
Request:  
{  
  "expression": "A + BC'"  
}  

POST /generate_verilog  
Generate Verilog and simulate.  
Request:  
{  
  "expression": "(A + B)'C"  
}  

## Supported Expression Examples

A + B'

AB + A'C

(A + B)(C' + D)

A ^ B

A'BC + AB'C
