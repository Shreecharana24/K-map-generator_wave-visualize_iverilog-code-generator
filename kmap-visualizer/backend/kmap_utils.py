import re
import itertools
from collections import OrderedDict

class BooleanExpressionSolver:
    def __init__(self):
        self.operators = {'&', '|', '~', '!', '^', 'AND', 'OR', 'NOT', 'XOR'}
        self.operator_map = {
            'AND': '&', 'OR': '|', 'NOT': '~', 'XOR': '^'
        }
    
    def extract_variables(self, expression):
        """Extract all variables from the expression (uppercase and lowercase letters)"""
        # Find all valid variable names (single letters)
        variables = set(re.findall(r'\b[A-Za-z]\b', expression))
        return sorted(list(variables))
    
    def normalize_expression(self, expression):
        """Normalize the expression to use consistent operators"""
        expr = expression.upper()
        
        # Replace word operators with symbols
        for word, symbol in self.operator_map.items():
            expr = re.sub(r'\b' + word + r'\b', symbol, expr)
        
        # Ensure proper spacing around operators
        expr = re.sub(r'\s+', ' ', expr)  # Remove extra spaces
        expr = re.sub(r'([&|^~!])', r' \1 ', expr)  # Space around operators
        expr = re.sub(r'\(', ' ( ', expr)  # Space around parentheses
        expr = re.sub(r'\)', ' ) ', expr)
        expr = re.sub(r'\s+', ' ', expr)  # Clean up multiple spaces
        
        return expr.strip()
    
    def evaluate_expression(self, expr, variable_values):
        """Safely evaluate the Boolean expression with given variable values"""
        # Create a safe evaluation environment
        env = {var: bool(value) for var, value in variable_values.items()}
        env.update({
            'True': True,
            'False': False,
            'true': True,
            'false': False
        })
        
        # Convert expression to Python logical operations
        python_expr = expr
        python_expr = python_expr.replace('&', ' and ')
        python_expr = python_expr.replace('|', ' or ')
        python_expr = python_expr.replace('~', ' not ')
        python_expr = python_expr.replace('!', ' not ')
        python_expr = python_expr.replace('^', ' != ')  # XOR implementation
        
        try:
            # Use eval with limited environment
            result = eval(python_expr, {"__builtins__": {}}, env)
            return bool(result)
        except Exception as e:
            raise ValueError(f"Error evaluating expression: {e}")
    
    def solve_expression(self, expression):
        """Main method to solve Boolean expression and generate truth table"""
        if not expression:
            raise ValueError("Empty expression provided")
        
        # Extract and validate variables
        variables = self.extract_variables(expression)
        if not variables:
            raise ValueError("No valid variables found in expression")
        
        if len(variables) > 6:
            raise ValueError("Too many variables (maximum 6 allowed)")
        
        # Normalize expression
        normalized_expr = self.normalize_expression(expression)
        
        # Generate truth table
        truth_table = self.generate_truth_table(normalized_expr, variables)
        
        # Generate simplified expression
        simplified_expr = self.simplify_expression(truth_table, variables)
        
        return {
            'expression': expression,
            'normalized_expression': normalized_expr,
            'variables': variables,
            'truth_table': truth_table,
            'simplified_expression': simplified_expr
        }
    
    def generate_truth_table(self, expression, variables):
        """Generate complete truth table for the expression"""
        truth_table = []
        num_vars = len(variables)
        
        # Generate all possible combinations
        for combination in itertools.product([0, 1], repeat=num_vars):
            row = {}
            variable_values = {}
            
            # Assign values to variables
            for i, var in enumerate(variables):
                row[var] = combination[i]
                variable_values[var] = combination[i]
            
            # Evaluate expression
            try:
                output = self.evaluate_expression(expression, variable_values)
                row['output'] = output
                truth_table.append(row)
            except Exception as e:
                raise ValueError(f"Error evaluating expression with values {variable_values}: {e}")
        
        return truth_table
    
    def simplify_expression(self, truth_table, variables):
        """Simplify Boolean expression using basic rules"""
        if len(variables) == 1:
            return self._simplify_single_variable(truth_table, variables[0])
        elif len(variables) <= 4:
            return self._simplify_with_kmap(truth_table, variables)
        else:
            return self._get_original_expression(truth_table, variables)
    
    def _simplify_single_variable(self, truth_table, variable):
        """Simplify single variable expressions"""
        outputs = [row['output'] for row in truth_table]
        
        if all(outputs):
            return "1"
        elif not any(outputs):
            return "0"
        elif outputs[0] and not outputs[1]:
            return variable
        elif not outputs[0] and outputs[1]:
            return f"~{variable}"
        else:
            return f"{variable}"  # Fallback
    
    def _simplify_with_kmap(self, truth_table, variables):
        """Simplify using K-map method (basic implementation)"""
        try:
            # Get minterms
            minterms = []
            for i, row in enumerate(truth_table):
                if row['output']:
                    minterms.append(i)
            
            if not minterms:
                return "0"
            
            if len(minterms) == len(truth_table):
                return "1"
            
            # For now, return a basic simplified form
            # In a full implementation, you would use Quine-McCluskey or similar algorithm
            return self._get_sop_expression(truth_table, variables)
            
        except:
            return self._get_original_expression(truth_table, variables)
    
    def _get_sop_expression(self, truth_table, variables):
        """Get Sum of Products expression"""
        terms = []
        for row in truth_table:
            if row['output']:
                term_parts = []
                for var in variables:
                    if row[var] == 0:
                        term_parts.append(f"~{var}")
                    else:
                        term_parts.append(var)
                terms.append(" & ".join(term_parts))
        
        if not terms:
            return "0"
        
        return " | ".join(terms) if len(terms) > 1 else terms[0]
    
    def _get_original_expression(self, truth_table, variables):
        """Fallback to original expression format"""
        return " | ".join([f"row{i}" for i in range(len(truth_table)) if truth_table[i]['output']])
    
    def generate_kmap(self, truth_table, variables):
        """Generate K-map representation"""
        num_vars = len(variables)
        
        if num_vars == 0:
            return None
        elif num_vars == 1:
            return self._generate_1var_kmap(truth_table, variables)
        elif num_vars == 2:
            return self._generate_2var_kmap(truth_table, variables)
        elif num_vars == 3:
            return self._generate_3var_kmap(truth_table, variables)
        elif num_vars == 4:
            return self._generate_4var_kmap(truth_table, variables)
        else:
            return None  # K-map not supported for >4 variables
    
    def _generate_1var_kmap(self, truth_table, variables):
        """Generate 1-variable K-map"""
        return {
            'rows': ['0', '1'],
            'cols': [''],
            'row_var': variables[0],
            'col_var': '',
            'grid': [
                [truth_table[0]['output']],
                [truth_table[1]['output']]
            ]
        }
    
    def _generate_2var_kmap(self, truth_table, variables):
        """Generate 2-variable K-map"""
        return {
            'rows': ['0', '1'],
            'cols': ['0', '1'],
            'row_var': variables[0],
            'col_var': variables[1],
            'grid': [
                [truth_table[0]['output'], truth_table[1]['output']],  # A=0: B=0, B=1
                [truth_table[2]['output'], truth_table[3]['output']]   # A=1: B=0, B=1
            ]
        }
    
    def _generate_3var_kmap(self, truth_table, variables):
        """Generate 3-variable K-map with Gray code ordering"""
        # Gray code ordering: 00, 01, 11, 10
        gray_order = ['00', '01', '11', '10']
        
        grid = []
        for i, row_code in enumerate(gray_order[:2]):  # A=0,1
            row_vals = []
            for col_code in gray_order:
                # Find the row matching this Gray code combination
                a_val = int(row_code)
                bc_vals = [int(bit) for bit in col_code]
                
                for row in truth_table:
                    if (row[variables[0]] == a_val and 
                        row[variables[1]] == bc_vals[0] and 
                        row[variables[2]] == bc_vals[1]):
                        row_vals.append(row['output'])
                        break
            grid.append(row_vals)
        
        return {
            'rows': ['0', '1'],
            'cols': gray_order,
            'row_var': variables[0],
            'col_var': f"{variables[1]}{variables[2]}",
            'grid': grid
        }
    
    def _generate_4var_kmap(self, truth_table, variables):
        """Generate 4-variable K-map with Gray code ordering"""
        gray_order = ['00', '01', '11', '10']
        
        grid = []
        for row_code in gray_order:
            row_vals = []
            for col_code in gray_order:
                # Find the row matching this Gray code combination
                ab_vals = [int(bit) for bit in row_code]
                cd_vals = [int(bit) for bit in col_code]
                
                for row in truth_table:
                    if (row[variables[0]] == ab_vals[0] and 
                        row[variables[1]] == ab_vals[1] and 
                        row[variables[2]] == cd_vals[0] and 
                        row[variables[3]] == cd_vals[1]):
                        row_vals.append(row['output'])
                        break
            grid.append(row_vals)
        
        return {
            'rows': gray_order,
            'cols': gray_order,
            'row_var': f"{variables[0]}{variables[1]}",
            'col_var': f"{variables[2]}{variables[3]}",
            'grid': grid
        }
    
    def generate_verilog(self, expression, variables):
        """Generate Verilog code from Boolean expression"""
        module_name = "boolean_function"
        
        # Convert expression to Verilog syntax
        verilog_expr = expression
        verilog_expr = verilog_expr.replace('&', '&&')
        verilog_expr = verilog_expr.replace('|', '||')
        verilog_expr = verilog_expr.replace('~', '!')
        verilog_expr = verilog_expr.replace('^', '^')
        
        verilog_code = f"""module {module_name}({', '.join(variables)}, Y);
        input {', '.join(variables)};
        output Y;
        
        assign Y = {verilog_expr};
        
    endmodule

    // Testbench
    module testbench;
        reg {', '.join(variables)};
        wire Y;
        integer i;
        
        // Instantiate the module
        {module_name} uut({', '.join(variables)}, Y);
        
        initial begin
            // Initialize waveform dumping
            $dumpfile("waveform.vcd");
            $dumpvars(0, testbench);
            
            $display("Testing Boolean Expression: {expression}");
            $display("Time\\t{'\\t'.join(variables)}\\tY");
            $display("----------------------------------------");
            
            // Test all combinations using a loop
            for (i = 0; i < {2 ** len(variables)}; i = i + 1) begin
                {{{', '.join(variables)}}} = i;
                #10;
                $display("%0t\\t{'\\t%b'.join(['' for _ in variables])}\\t%b", 
                        $time, {', '.join(variables)}, Y);
            end
            
            #10;
            $display("----------------------------------------");
            $display("Simulation completed successfully");
            $finish;
        end
    endmodule"""
        
        return verilog_code
        
    def _generate_test_cases(self, variables):
        """Generate test cases for Verilog testbench"""
        test_cases = []
        num_vars = len(variables)
        
        # Generate all 2^num_vars combinations
        for i in range(2 ** num_vars):
            values = []
            for j in range(num_vars):
                bit = (i >> (num_vars - 1 - j)) & 1
                values.append(str(bit))
            
            # Create individual assignments for each variable
            assignments = []
            for idx, var in enumerate(variables):
                assignments.append(f"{var} = 1'b{values[idx]};")
            
            test_case = "\n        ".join(assignments)
            test_cases.append(f"        {test_case}")
            test_cases.append("        #10;")
        
        return "\n".join(test_cases)