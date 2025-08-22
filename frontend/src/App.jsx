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
      prompt: "I want a database for an e-commerce site with customers, orders, and products..."
    },
    {
      title: "Library Management",
      description: "Books, authors, members, borrowing system",
      prompt: "Design a database for a library management system..."
    },
    {
      title: "Task Management",
      description: "Projects, tasks, team members, deadlines",
      prompt: "Create a database for a task management application..."
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
      setTimeout(() => setCopiedStates({ ...copiedStates, [key]: false }), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const MermaidDiagram = ({ code }) => {
    useEffect(() => {
      if (typeof window !== 'undefined' && window.mermaid && code) {
        window.mermaid.initialize({ startOnLoad: false });
        const renderDiagram = async () => {
          try {
            const { svg } = await window.mermaid.render('mermaid-diagram', code);
            const diagramElement = document.getElementById('diagram-container');
            if (diagramElement) diagramElement.innerHTML = svg;
          } catch (err) {
            console.error('Mermaid rendering error:', err);
          }
        };
        renderDiagram();
      }
    }, [code]);

    return <div id="diagram-container" className="diagram-container"></div>;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.mermaid) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js';
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
          <p>Design and sculpt your database schema with AI Michaelangelo</p>
        </header>

        {/* Input Section */}
        <div className="card">
          <div className="form-group">
            <label htmlFor="description">Describe your application or database needs:</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Example: I want a database for an e-commerce site with customers, orders, and products. Customers can place multiple orders, and each order can contain multiple products..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="database_type">Database Type:</label>
            <select
              id="database_type"
              value={formData.database_type}
              onChange={(e) => setFormData({ ...formData, database_type: e.target.value })}
            >
              <option value="MySQL">MySQL</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="SQLite">SQLite</option>
              <option value="SQL Server">SQL Server</option>
            </select>
          </div>

          <button onClick={handleSubmit} disabled={isLoading || !formData.description.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="loading-icon" />
                Generating Design...
              </>
            ) : (
              <>
                <Zap className="loading-icon" />
                Generate Database Design
              </>
            )}
          </button>

          <div className="examples-section">
            <h3>Try these examples:</h3>
            <div className="examples">
              {examples.map((example, index) => (
                <div key={index} onClick={() => fillExample(example)} className="example-card">
                  <h4>{example.title}</h4>
                  <p>{example.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-box">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="results">
            <div className="card">
              <div className="card-header">
                <h3>SQL Code</h3>
                <button onClick={() => copyToClipboard(results.sql_queries, 'sql')}>
                  {copiedStates.sql ? "Copied!" : "Copy SQL"}
                </button>
              </div>
              <pre><code>{results.sql_queries}</code></pre>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Visual Diagram</h3>
                <button onClick={() => copyToClipboard(results.erd_mermaid, 'mermaid')}>
                  {copiedStates.mermaid ? "Copied!" : "Copy Diagram Code"}
                </button>
              </div>
              <MermaidDiagram code={results.erd_mermaid} />
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Design Explanation</h3>
              </div>
              <p className="explanation">{results.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;