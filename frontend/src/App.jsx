// cd frontend
// npm run dev

import React, { useState, useEffect } from 'react';
import { Copy, Database, Zap, FileText, Loader2, CheckCircle } from 'lucide-react';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    description: '',
    database_type: 'MySQL'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [copiedStates, setCopiedStates] = useState({});

  const examples = [
    {
      title: "E-commerce Platform",
      description: "Users, products, orders, shopping cart, payments",
      prompt: "I want a database for an e-commerce site with customers, orders, and products. Customers can place multiple orders, and each order can contain multiple products. I also need to track inventory, shipping addresses, and payment information."
    },
    {
      title: "Library Management",
      description: "Books, authors, members, borrowing system",
      prompt: "Design a database for a library management system. I need to track books, authors, library members, and borrowing records. Books can have multiple authors, and members can borrow multiple books with due dates."
    },
    {
      title: "Task Management",
      description: "Projects, tasks, team members, deadlines",
      prompt: "Create a database for a task management application. I need projects, tasks within projects, team members, and task assignments. Tasks should have priorities, deadlines, and status tracking."
    }
  ];

  const fillExample = (example) => {
    setFormData({ ...formData, description: example.prompt });
  };

  const handleSubmit = async () => {
    if (!formData.description.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/design-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const MermaidDiagram = ({ code }) => {
    useEffect(() => {
      if (typeof window !== 'undefined' && window.mermaid && code) {
        window.mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#d1d5db',
            lineColor: '#6b7280'
          }
        });

        const renderDiagram = async () => {
          try {
            const { svg } = await window.mermaid.render('mermaid-diagram', code);
            const diagramElement = document.getElementById('diagram-container');
            if (diagramElement) {
              diagramElement.innerHTML = svg;
            }
          } catch (err) {
            console.error('Mermaid rendering error:', err);
            const diagramElement = document.getElementById('diagram-container');
            if (diagramElement) {
              diagramElement.innerHTML = `
                <div class="diagram-error">
                  <p class="error-title">Diagram rendering failed</p>
                  <pre class="error-code">${code}</pre>
                </div>
              `;
            }
          }
        };

        renderDiagram();
      }
    }, [code]);

    return (
      <div id="diagram-container" className="diagram-container">
        <div className="diagram-loading">
          <Loader2 className="loading-spinner" />
          <p>Rendering diagram...</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Load Mermaid script
    if (typeof window !== 'undefined' && !window.mermaid) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js';
      script.onload = () => {
        console.log('Mermaid loaded');
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            <Database className="header-icon" />
            <h1>DataAngelo</h1>
          </div>
          <p className="header-subtitle">
            Design and sculpt your database schema with Michaelangelo of data
          </p>
        </header>

        {/* Input Section */}
        <div className="input-section">
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Describe your application or database needs:
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
                placeholder="Example: I want a database for an e-commerce site with customers, orders, and products. Customers can place multiple orders, and each order can contain multiple products..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="database_type" className="form-label">
                Database Type:
              </label>
              <select
                id="database_type"
                value={formData.database_type}
                onChange={(e) => setFormData({ ...formData, database_type: e.target.value })}
                className="form-select"
              >
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="SQLite">SQLite</option>
                <option value="SQL Server">SQL Server</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.description.trim()}
              className={`submit-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="button-icon animate-spin" />
                  Generating Design...
                </>
              ) : (
                <>
                  <Zap className="button-icon" />
                  Generate Database Design
                </>
              )}
            </button>
          </div>

          {/* Example Prompts */}
          <div className="examples-section">
            <h3 className="examples-title">Try these examples:</h3>
            <div className="examples-grid">
              {examples.map((example, index) => (
                <div
                  key={index}
                  onClick={() => fillExample(example)}
                  className="example-card"
                >
                  <h4 className="example-title">{example.title}</h4>
                  <p className="example-description">{example.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-section">
            <Loader2 className="loading-icon" />
            <p className="loading-text">AI is designing your database schema...</p>
            <p className="loading-subtext">This may take 30-60 seconds.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-section">
            <div className="error-content">
              <h3 className="error-title">Error</h3>
              <p className="error-message">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="results-section">
            {/* SQL Section */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-title">
                  <Database className="result-icon" />
                  <h3>SQL Code</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(results.sql_queries, 'sql')}
                  className={`copy-button ${copiedStates.sql ? 'copied' : ''}`}
                >
                  {copiedStates.sql ? (
                    <>
                      <CheckCircle className="button-icon" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="button-icon" />
                      Copy SQL
                    </>
                  )}
                </button>
              </div>
              <div className="result-content">
                <pre className="sql-code">
                  <code>{results.sql_queries}</code>
                </pre>
              </div>
            </div>

            {/* Diagram Section */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-title">
                  <svg className="result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3>Visual Diagram</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(results.erd_mermaid, 'mermaid')}
                  className={`copy-button ${copiedStates.mermaid ? 'copied' : ''}`}
                >
                  {copiedStates.mermaid ? (
                    <>
                      <CheckCircle className="button-icon" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="button-icon" />
                      Copy Diagram Code
                    </>
                  )}
                </button>
              </div>
              <div className="result-content">
                <MermaidDiagram code={results.erd_mermaid} />
              </div>
            </div>

            {/* Explanation Section */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-title">
                  <FileText className="result-icon" />
                  <h3>Design Explanation</h3>
                </div>
              </div>
              <div className="result-content">
                <div className="explanation-content">
                  {results.explanation}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;