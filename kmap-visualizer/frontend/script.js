class DigitalLogicExplorer {
    constructor() {
        this.backendUrl = 'http://localhost:5000';
        this.chart = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isBackendConnected = false;
        this.learningStats = {
            expressionsTested: 0,
            gatesAnalyzed: 0,
            simulationsRun: 0
        };
        this.initializeTheme();
        this.checkBackendConnection();
        this.initializeEventListeners();
        this.applyAdvancedStyles();
        this.loadLearningStats();
    }

    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/`);
            if (response.ok) {
                this.isBackendConnected = true;
                this.updateLearningStatus('✅ Backend connected! Ready to analyze logic expressions.');
            } else {
                this.showBackendError();
            }
        } catch (error) {
            this.showBackendError();
        }
    }

    showBackendError() {
        this.isBackendConnected = false;
        this.updateLearningStatus('⚠️ Backend not connected. Using demo mode with sample data.');
    }

    initializeTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeToggle();
        
        if (this.chart) {
            this.updateChartTheme();
        }
    }

    updateThemeToggle() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' 
                ? 'fas fa-moon text-gray-700' 
                : 'fas fa-sun text-yellow-400';
        }
    }

    applyAdvancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .action-btn {
                background: linear-gradient(135deg, var(--btn-color-1), var(--btn-color-2));
                color: white;
                font-weight: 600;
                padding: 1rem 1.5rem;
                border-radius: 1rem;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                font-size: 1.125rem;
                border: none;
                cursor: pointer;
                min-height: 60px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }

            #generateTruthTableBtn {
                --btn-color-1: #3b82f6;
                --btn-color-2: #1d4ed8;
            }

            #generateKmapBtn {
                --btn-color-1: #8b5cf6;
                --btn-color-2: #7c3aed;
            }

            #generateVerilogBtn {
                --btn-color-1: #10b981;
                --btn-color-2: #059669;
            }

            #resetBtn {
                --btn-color-1: #6b7280;
                --btn-color-2: #4b5563;
            }

            .example-btn {
                background: rgba(255, 255, 255, 0.8);
                color: #374151;
                font-weight: 500;
                padding: 0.75rem 1rem;
                border-radius: 0.75rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(209, 213, 219, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                cursor: pointer;
                backdrop-filter: blur(10px);
            }

            .dark .example-btn {
                background: rgba(31, 41, 55, 0.8);
                color: #d1d5db;
                border: 1px solid rgba(75, 85, 99, 0.5);
            }

            .example-btn:hover {
                background: white;
                border-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .dark .example-btn:hover {
                background: rgba(55, 65, 81, 0.8);
                border-color: #60a5fa;
            }

            .result-section { 
                animation: slideIn 0.5s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    loadLearningStats() {
        const saved = localStorage.getItem('learningStats');
        if (saved) {
            this.learningStats = JSON.parse(saved);
        }
    }

    saveLearningStats() {
        localStorage.setItem('learningStats', JSON.stringify(this.learningStats));
    }

    updateLearningStatus(message) {
        const statusElement = document.getElementById('learningStatus');
        const messageElement = document.getElementById('statusMessage');
        if (statusElement && messageElement) {
            statusElement.classList.remove('hidden');
            messageElement.textContent = message;
        }
    }

    initializeEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());

        const buttons = [
            'generateTruthTableBtn',
            'generateKmapBtn', 
            'generateVerilogBtn',
            'resetBtn'
        ];

        buttons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', () => this[btnId.replace('Btn', '')]());
            }
        });

        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expression = e.target.getAttribute('data-expr');
                const input = document.getElementById('expressionInput');
                if (input) input.value = expression;
                this.updateLearningStatus('Ready to analyze this logic expression!');
            });
        });

        const expressionInput = document.getElementById('expressionInput');
        if (expressionInput) {
            expressionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.generateTruthTable();
            });
        }
    }

    async generateTruthTable() {
        const expression = this.getExpression();
        if (!expression) {
            this.showError('Please enter a Boolean expression to analyze');
            return;
        }

        this.showLoading();
        this.hideAllResults();
        this.hideError();
        this.updateLearningStatus('Generating truth table and analyzing logic gates...');

        try {
            const response = await fetch(`${this.backendUrl}/generate_truth_table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression })
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Server returned error');
            }

            this.learningStats.expressionsTested++;
            this.learningStats.gatesAnalyzed += data.variables?.length || 0;
            this.saveLearningStats();
            
            this.displayTruthTable(data);
            this.updateLearningStatus(`Analyzed ${data.variables?.length || 0} variables with ${data.truth_table?.length || 0} combinations`);
            
        } catch (error) {
            console.error('Truth table error:', error);
            this.showError(error.message || 'Failed to generate truth table');
        } finally {
            this.hideLoading();
        }
    }

    async generateKmap() {
        const expression = this.getExpression();
        if (!expression) {
            this.showError('Please enter a Boolean expression to visualize');
            return;
        }

        this.showLoading();
        this.hideAllResults();
        this.hideError();
        this.updateLearningStatus('Creating Karnaugh map and optimizing logic expression...');

        try {
            const response = await fetch(`${this.backendUrl}/generate_kmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression })
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Server returned error');
            }

            this.displayKmap(data);
            this.updateLearningStatus('K-map optimization completed. Check prime implicants!');
            
        } catch (error) {
            console.error('K-map error:', error);
            this.showError(error.message || 'Failed to generate K-map');
        } finally {
            this.hideLoading();
        }
    }

    async generateVerilog() {
        const expression = this.getExpression();
        if (!expression) {
            this.showError('Please enter a Boolean expression to simulate');
            return;
        }

        this.showLoading();
        this.hideAllResults();
        this.hideError();
        this.updateLearningStatus('Generating Verilog code and running simulation...');

        try {
            const response = await fetch(`${this.backendUrl}/generate_verilog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression })
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Server returned error');
            }

            this.learningStats.simulationsRun++;
            this.saveLearningStats();
            
            this.displayVerilogResults(data);
            this.updateLearningStatus('Verilog simulation completed successfully!');
            
        } catch (error) {
            console.error('Verilog error:', error);
            this.showError(error.message || 'Failed to generate Verilog simulation');
        } finally {
            this.hideLoading();
        }
    }

    getExpression() {
        const input = document.getElementById('expressionInput');
        return input ? input.value.trim() : '';
    }

    displayTruthTable(data) {
        const container = document.getElementById('truthTableContainer');
        const variableCount = document.getElementById('variableCount');
        
        if (!container) return;

        container.innerHTML = '';

        const variables = data.variables || [];
        const truthTable = data.truth_table || [];

        if (variableCount) {
            variableCount.textContent = `${variables.length} Variables, ${truthTable.length} Combinations`;
        }

        if (truthTable.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-table text-4xl mb-4"></i>
                    <p>No truth table data available</p>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        variables.forEach(variable => {
            const th = document.createElement('th');
            th.className = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold p-4 text-lg sticky top-0';
            th.textContent = variable;
            headerRow.appendChild(th);
        });

        const outputTh = document.createElement('th');
        outputTh.className = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold p-4 text-lg sticky top-0';
        outputTh.textContent = 'Output';
        outputTh.innerHTML += ' <i class="fas fa-arrow-right ml-1"></i>';
        headerRow.appendChild(outputTh);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        
        truthTable.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.className = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700';

            variables.forEach(variable => {
                const td = document.createElement('td');
                td.className = 'p-4 text-center border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white';
                td.textContent = row[variable] ?? '?';
                tr.appendChild(td);
            });

            const outputTd = document.createElement('td');
            const output = row.output ?? false;
            outputTd.className = output ? 
                'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold p-4 text-center' : 
                'bg-gradient-to-r from-red-500 to-red-600 text-white font-bold p-4 text-center';
            outputTd.textContent = output ? '1' : '0';
            outputTd.innerHTML += output ? ' <i class="fas fa-check ml-1"></i>' : ' <i class="fas fa-times ml-1"></i>';
            tr.appendChild(outputTd);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);

        this.showResultSection('truthTableResults');
    }

    displayKmap(data) {
        const container = document.getElementById('kmapContainer');
        if (!container) return;

        container.innerHTML = '';

        if (!data.kmap) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-border-all text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600 dark:text-gray-400 text-lg">K-map not available for this expression</p>
                    <p class="text-gray-500 dark:text-gray-500 text-sm mt-2">Try an expression with 1-4 variables</p>
                </div>
            `;
            return;
        }

        const table = document.createElement('table');
        table.className = 'border-collapse border-2 border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800';

        // Create headers
        const thead = document.createElement('thead');
        let headerRow = document.createElement('tr');
        
        const emptyHeader = document.createElement('th');
        emptyHeader.className = 'bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold p-6 text-lg';
        emptyHeader.textContent = data.kmap.row_var || '';
        headerRow.appendChild(emptyHeader);

        (data.kmap.cols || []).forEach(col => {
            const th = document.createElement('th');
            th.className = 'bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold p-6 text-lg';
            th.textContent = col;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        
        (data.kmap.grid || []).forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            
            const rowHeader = document.createElement('th');
            rowHeader.className = 'bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold p-6 text-lg';
            rowHeader.textContent = (data.kmap.rows || [])[rowIndex] || '';
            tr.appendChild(rowHeader);

            (row || []).forEach((cell, colIndex) => {
                const td = document.createElement('td');
                td.className = cell ? 
                    'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white font-bold p-6 text-center text-lg shadow-inner transform scale-105' : 
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold p-6 text-center text-lg border-2 border-gray-300 dark:border-gray-600';
                td.textContent = cell ? '1' : '0';
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);

        this.displaySimplificationResults(data);
        this.showResultSection('kmapResults');
    }

    displaySimplificationResults(data) {
        const container = document.getElementById('simplificationResults');
        if (!container) return;

        const truthTable = data.truth_table || [];
        const variables = data.variables || [];
        const primeImplicants = this.generatePrimeImplicants(truthTable, variables);
        const simplifiedExpr = data.simplified_expression || 'No simplification available';

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                        <i class="fas fa-puzzle-piece text-purple-500"></i>
                        Prime Implicants
                        <span class="bg-purple-500 text-white text-sm px-3 py-1 rounded-full">Essential</span>
                    </h3>
                    <div class="space-y-3">
                        ${primeImplicants.length > 0 ? primeImplicants.map((imp, index) => `
                            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-purple-500 shadow-sm flex items-center gap-3">
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg px-3 py-1 font-mono text-sm">P${index + 1}</span>
                                <code class="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1">${imp}</code>
                            </div>
                        `).join('') : 
                        '<div class="text-center py-6 text-gray-500 dark:text-gray-400"><i class="fas fa-info-circle mr-2"></i>No prime implicants found</div>'}
                    </div>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                        <i class="fas fa-bolt text-green-500"></i>
                        Optimized Expression
                        <span class="bg-green-500 text-white text-sm px-3 py-1 rounded-full">Simplified</span>
                    </h3>
                    <div class="text-center">
                        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                            <code class="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
                                ${this.formatBooleanExpression(simplifiedExpr)}
                            </code>
                        </div>
                        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                            <i class="fas fa-arrow-down text-blue-500"></i>
                            <span>Simplified from:</span>
                            <code class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-xs font-mono">${data.expression || 'Unknown'}</code>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePrimeImplicants(truthTable, variables) {
        if (!truthTable || !Array.isArray(truthTable) || !variables || !Array.isArray(variables)) {
            return ["Invalid data"];
        }

        const minterms = truthTable
            .map((row, index) => (row && row.output) ? index : -1)
            .filter(index => index !== -1);

        if (minterms.length === 0) return ["0"];
        if (minterms.length === truthTable.length) return ["1"];

        const implicants = minterms.map(minterm => {
            const binary = minterm.toString(2).padStart(variables.length, '0');
            let terms = [];
            variables.forEach((varName, idx) => {
                if (binary[idx] === '1') {
                    terms.push(varName);
                } else {
                    terms.push(`~${varName}`);
                }
            });
            return terms.join('·');
        });

        return implicants.slice(0, Math.min(4, implicants.length));
    }

    formatBooleanExpression(expr) {
        if (!expr) return 'No expression';
        return expr
            .replace(/&/g, '·')
            .replace(/\|/g, ' + ')
            .replace(/~/g, '¬')
            .replace(/!/g, '¬');
    }

    displayVerilogResults(data) {
        const verilogCode = document.getElementById('verilogCode');
        const simulationOutput = document.getElementById('simulationOutput');
        
        if (verilogCode) {
            verilogCode.textContent = data.verilog_code || '// No Verilog code generated';
        }
        
        if (simulationOutput) {
            simulationOutput.textContent = data.simulation_output || 'No simulation output available';
        }

        if (data.waveform_data && Object.keys(data.waveform_data).length > 0) {
            this.createWaveformChart(data.waveform_data);
        } else {
            this.showNoWaveformMessage();
        }

        this.showResultSection('verilogResults');
    }

    createWaveformChart(waveformData) {
        const ctx = document.getElementById('waveformChart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const datasets = [];
        let signalIndex = 0;

        Object.keys(waveformData).forEach((signalName) => {
            const signal = waveformData[signalName];
            if (!signal || !signal.times || !signal.values) return;

            const color = colors[signalIndex % colors.length];
            const data = [];
            
            for (let i = 0; i < signal.times.length; i++) {
                data.push({ x: signal.times[i], y: signal.values[i] });
                if (i < signal.times.length - 1) {
                    data.push({ x: signal.times[i + 1], y: signal.values[i] });
                }
            }

            datasets.push({
                label: signal.name || `Signal ${signalIndex + 1}`,
                data: data,
                borderColor: color,
                backgroundColor: color + '40',
                borderWidth: 4,
                fill: false,
                tension: 0,
                stepped: 'before',
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            });

            signalIndex++;
        });

        if (datasets.length === 0) {
            this.showNoWaveformMessage();
            return;
        }

        const isDark = this.currentTheme === 'dark';
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeOutQuart' },
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Time (ns)',
                            color: isDark ? '#ffffff' : '#374151',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 2
                        },
                        ticks: {
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            font: { size: 12 }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Digital Signal',
                            color: isDark ? '#ffffff' : '#374151',
                            font: { size: 14, weight: 'bold' }
                        },
                        min: -0.2,
                        max: 1.2,
                        ticks: {
                            stepSize: 1,
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            font: { size: 12 },
                            callback: function(value) {
                                return value === 1 ? 'HIGH (1)' : value === 0 ? 'LOW (0)' : '';
                            }
                        },
                        grid: {
                            color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDark ? '#ffffff' : '#374151',
                            font: { size: 13, weight: 'bold' },
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    showNoWaveformMessage() {
        const chartContainer = document.getElementById('waveformChart');
        if (!chartContainer) return;

        chartContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center p-8">
                <i class="fas fa-wave-square text-6xl text-gray-400 mb-6"></i>
                <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-3">No Waveform Data Available</h3>
                <p class="text-gray-500 dark:text-gray-500 max-w-md text-lg leading-relaxed">
                    The digital simulation completed successfully, but waveform visualization isn't available.
                </p>
            </div>
        `;
    }

    showResultSection(sectionId) {
        this.hideAllResults();
        const section = document.getElementById(sectionId);
        const resultsSection = document.getElementById('resultsSection');
        if (section) section.classList.remove('hidden');
        if (resultsSection) resultsSection.classList.remove('hidden');
    }

    reset() {
        const input = document.getElementById('expressionInput');
        if (input) input.value = '';
        this.hideAllResults();
        this.hideError();
        this.hideLearningStatus();
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        this.updateLearningStatus('Ready to explore digital logic! Enter a Boolean expression to begin.');
    }

    hideAllResults() {
        ['truthTableResults', 'kmapResults', 'verilogResults', 'resultsSection'].forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.classList.add('hidden');
        });
    }

    showLoading() {
        const loading = document.getElementById('loadingSpinner');
        if (loading) loading.classList.remove('hidden');
    }

    hideLoading() {
        const loading = document.getElementById('loadingSpinner');
        if (loading) loading.classList.add('hidden');
    }

    showError(message) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        if (errorAlert && errorMessage) {
            errorMessage.textContent = message;
            errorAlert.classList.remove('hidden');
        }
    }

    hideError() {
        const errorAlert = document.getElementById('errorAlert');
        if (errorAlert) errorAlert.classList.add('hidden');
    }

    hideLearningStatus() {
        const status = document.getElementById('learningStatus');
        if (status) status.classList.add('hidden');
    }

    updateChartTheme() {
        if (!this.chart) return;
        
        const isDark = this.currentTheme === 'dark';
        this.chart.options.scales.x.ticks.color = isDark ? '#9CA3AF' : '#6B7280';
        this.chart.options.scales.y.ticks.color = isDark ? '#9CA3AF' : '#6B7280';
        this.chart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        this.chart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        this.chart.options.scales.x.title.color = isDark ? '#ffffff' : '#374151';
        this.chart.options.scales.y.title.color = isDark ? '#ffffff' : '#374151';
        this.chart.options.plugins.legend.labels.color = isDark ? '#ffffff' : '#374151';
        
        this.chart.update();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new DigitalLogicExplorer();
});