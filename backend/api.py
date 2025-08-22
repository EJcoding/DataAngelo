# uvicorn backend.api:app --app-dir . --reload
# http://127.0.0.1:8000/docs


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import requests
import json
import re
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DataAngelo: AI Database Architect")

# enable CORS
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class DatabaseRequest(BaseModel):
    description: str
    database_type: str = "MySQL"  # Default to MySQL
    
class DatabaseResponse(BaseModel):
    erd_mermaid: str
    sql_queries: str
    explanation: str
    
# Ollama configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "codellama:7b"  # changeable with different models

def query_ollama(prompt: str, model: str = MODEL_NAME) -> str:
    """Query Ollama local LLM"""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Low temperature for more consistent technical output
                    "top_p": 0.9,
                    "top_k": 40
                }
            },
            timeout=120  # 2 minute timeout for complex queries
        )
        response.raise_for_status()
        return response.json().get("response", "")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {str(e)}")

def create_database_design_prompt(description: str, db_type: str) -> str:
    """Create a comprehensive prompt for database design"""
    return f"""You are an expert database architect. Based on the following application description, design a complete database schema.

Application Description: {description}
Database Type: {db_type}

Please provide your response in exactly this format:

## ERD (Mermaid)
```mermaid
erDiagram
    [Your Entity Relationship Diagram here using Mermaid syntax]
```

## SQL Queries
```sql
-- Your CREATE TABLE statements here
-- Include primary keys, foreign keys, indexes, and constraints
-- Use MySQL-specific syntax and data types (INT AUTO_INCREMENT, VARCHAR, etc.)
-- Include ENGINE=InnoDB and CHARACTER SET specifications
```

## Design Explanation
Provide a detailed explanation of:
1. Why you chose this schema design
2. Relationships between tables and their reasoning
3. Key design decisions (normalization level, indexing strategy, etc.)
4. Scalability considerations
5. Any assumptions made about the requirements

Focus on best practices for {db_type} and ensure the design is normalized, efficient, and scalable."""

def extract_sections(response: str) -> Dict[str, str]:
    """Extract the three sections from the LLM response"""
    sections = {
        "erd_mermaid": "",
        "sql_queries": "",
        "explanation": ""
    }
    
    # Extract Mermaid ERD
    mermaid_match = re.search(r'```mermaid\n(.*?)```', response, re.DOTALL)
    if mermaid_match:
        sections["erd_mermaid"] = mermaid_match.group(1).strip()
    
    # Extract SQL queries
    sql_match = re.search(r'```sql\n(.*?)```', response, re.DOTALL)
    if sql_match:
        sections["sql_queries"] = sql_match.group(1).strip()
    
    # Extract explanation (everything after "## Design Explanation")
    explanation_match = re.search(r'## Design Explanation\n(.*?)(?=\n##|\Z)', response, re.DOTALL)
    if explanation_match:
        sections["explanation"] = explanation_match.group(1).strip()
    else:
        # Fallback: look for explanation after the SQL block
        parts = response.split('```')
        if len(parts) >= 5:  # Should have mermaid, sql, and explanation
            sections["explanation"] = parts[-1].strip()
    
    return sections

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Database Design AI Agent is running!", "status": "healthy"}

@app.get("/models")
async def get_available_models():
    """Get list of available Ollama models"""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        response.raise_for_status()
        models = response.json().get("models", [])
        return {"available_models": [model["name"] for model in models]}
    except requests.exceptions.RequestException:
        return {"error": "Could not connect to Ollama. Make sure it's running."}

@app.post("/design-database", response_model=DatabaseResponse)
async def design_database(request: DatabaseRequest):
    """
    Design a database schema based on the user's description
    """
    try:
        # Create the prompt
        prompt = create_database_design_prompt(request.description, request.database_type)
        
        # Query the LLM
        response = query_ollama(prompt)
        
        if not response:
            raise HTTPException(status_code=500, detail="Empty response from LLM")
        
        # Extract the sections
        sections = extract_sections(response)
        
        # Validate that we got all sections
        missing_sections = [k for k, v in sections.items() if not v.strip()]
        if missing_sections:
            # If sections are missing, return the raw response with a warning
            return DatabaseResponse(
                erd_mermaid=sections.get("erd_mermaid", "Could not extract Mermaid diagram"),
                sql_queries=sections.get("sql_queries", "Could not extract SQL queries"),
                explanation=sections.get("explanation", response)  # Fallback to full response
            )
        
        return DatabaseResponse(**sections)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating database design: {str(e)}")

@app.post("/validate-design")
async def validate_design(request: dict):
    """
    Validate and provide feedback on an existing database design
    """
    design = request.get("design", "")
    requirements = request.get("requirements", "")
    
    validation_prompt = f"""
    Review this database design against the requirements and provide feedback:
    
    Requirements: {requirements}
    
    Current Design: {design}
    
    Please analyze:
    1. Completeness - does it meet all requirements?
    2. Normalization - is it properly normalized?
    3. Performance - are there potential bottlenecks?
    4. Scalability - will it scale well?
    5. Security - are there security considerations?
    
    Provide specific recommendations for improvement.
    """
    
    try:
        response = query_ollama(validation_prompt)
        return {"validation_feedback": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating design: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)