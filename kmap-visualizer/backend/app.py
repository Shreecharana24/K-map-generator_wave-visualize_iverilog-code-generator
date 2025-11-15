from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import json
import re
from kmap_utils import BooleanExpressionSolver
from verilog_runner import VerilogSimulator

app = Flask(__name__)
CORS(app)

# Initialize solvers
boolean_solver = BooleanExpressionSolver()
verilog_simulator = VerilogSimulator()

@app.route('/')
def home():
    return jsonify({
        "message": "Boolean Expression Solver API",
        "endpoints": {
            "/generate_truth_table": "Generate truth table for Boolean expression",
            "/generate_kmap": "Generate K-map and simplified expression",
            "/generate_verilog": "Generate Verilog code and simulate"
        }
    })

@app.route('/generate_truth_table', methods=['POST'])
def generate_truth_table():
    try:
        data = request.get_json()
        expression = data.get('expression', '').strip()
        
        if not expression:
            return jsonify({"success": False, "error": "No expression provided"})
        
        # Process the expression
        result = boolean_solver.solve_expression(expression)
        
        return jsonify({
            "success": True,
            "expression": expression,
            "variables": result['variables'],
            "truth_table": result['truth_table'],
            "num_variables": len(result['variables'])
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/generate_kmap', methods=['POST'])
def generate_kmap():
    try:
        data = request.get_json()
        expression = data.get('expression', '').strip()
        
        if not expression:
            return jsonify({"success": False, "error": "No expression provided"})
        
        # Process the expression
        result = boolean_solver.solve_expression(expression)
        
        # Generate K-map
        kmap_result = boolean_solver.generate_kmap(result['truth_table'], result['variables'])
        
        return jsonify({
            "success": True,
            "expression": expression,
            "variables": result['variables'],
            "kmap": kmap_result,
            "simplified_expression": result['simplified_expression']
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/generate_verilog', methods=['POST'])
def generate_verilog():
    try:
        data = request.get_json()
        expression = data.get('expression', '').strip()
        
        if not expression:
            return jsonify({"success": False, "error": "No expression provided"})
        
        # Process the expression first
        result = boolean_solver.solve_expression(expression)
        
        # Generate Verilog code
        verilog_code = boolean_solver.generate_verilog(expression, result['variables'])
        
        # Simulate the Verilog code
        simulation_result = verilog_simulator.simulate_verilog(verilog_code)
        
        return jsonify({
            "success": True,
            "expression": expression,
            "variables": result['variables'],
            "verilog_code": verilog_code,
            "simulation_output": simulation_result.get('simulation_output', ''),
            "waveform_data": simulation_result.get('waveform_data', {})
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    print("Starting Boolean Expression Solver Server...")
    print("Available endpoints:")
    print("  POST /generate_truth_table")
    print("  POST /generate_kmap") 
    print("  POST /generate_verilog")
    print("\nServer running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)