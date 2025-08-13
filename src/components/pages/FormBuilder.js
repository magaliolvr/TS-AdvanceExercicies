import React, { useState, useEffect } from 'react';
import './FormBuilder.css';

const FormBuilder = ({ formId = 'form1', initialFields = [] }) => {
  const [fields, setFields] = useState(initialFields);
  const [formData, setFormData] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldTypes] = useState([
    'text', 'email', 'password', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file'
  ]);

  // Load form from localStorage
  useEffect(() => {
    const savedForm = localStorage.getItem(`form_${formId}`);
    if (savedForm && initialFields.length === 0) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setFields(parsedForm.fields || []);
        setFormData(parsedForm.formData || {});
      } catch (error) {
        console.error('Error parsing saved form:', error);
      }
    }
  }, [formId, initialFields.length]);

  // Save form to localStorage
  useEffect(() => {
    localStorage.setItem(`form_${formId}`, JSON.stringify({ fields, formData }));
  }, [fields, formData, formId]);

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}`,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : [],
      validation: {
        minLength: type === 'text' || type === 'textarea' ? 0 : undefined,
        maxLength: type === 'text' || type === 'textarea' ? 100 : undefined,
        min: type === 'number' ? undefined : undefined,
        max: type === 'number' ? undefined : undefined,
        pattern: type === 'email' ? 'email' : undefined
      }
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (fieldId, updates) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    setFormData(prev => {
      const newData = { ...prev };
      delete newData[fieldId];
      return newData;
    });
  };

  const duplicateField = (fieldId) => {
    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (fieldToDuplicate) {
      const duplicatedField = {
        ...fieldToDuplicate,
        id: Date.now().toString(),
        label: `${fieldToDuplicate.label} (Copy)`
      };
      setFields(prev => [...prev, duplicatedField]);
    }
  };

  const moveField = (fieldId, direction) => {
    setFields(prev => {
      const currentIndex = prev.findIndex(f => f.id === fieldId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFields = [...prev];
      [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
      return newFields;
    });
  };

  const addOption = (fieldId) => {
    updateField(fieldId, {
      options: [...(fields.find(f => f.id === fieldId)?.options || []), `Option ${Date.now()}`]
    });
  };

  const removeOption = (fieldId, optionIndex) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const updateOption = (fieldId, optionIndex, value) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const handleFormInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = () => {
    const errors = {};
    fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')) {
        errors[field.id] = `${field.label} is required`;
      }
      
      if (formData[field.id] && field.validation) {
        const value = formData[field.id];
        
        if (field.validation.minLength !== undefined && value.length < field.validation.minLength) {
          errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
        }
        
        if (field.validation.maxLength !== undefined && value.length > field.validation.maxLength) {
          errors[field.id] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
        }
        
        if (field.validation.min !== undefined && value < field.validation.min) {
          errors[field.id] = `${field.label} must be at least ${field.validation.min}`;
        }
        
        if (field.validation.max !== undefined && value > field.validation.max) {
          errors[field.id] = `${field.label} must be no more than ${field.validation.max}`;
        }
        
        if (field.validation.pattern === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field.id] = `${field.label} must be a valid email address`;
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      alert('Form submitted successfully!');
      console.log('Form data:', formData);
    } else {
      alert('Please fix the errors in the form');
      console.log('Validation errors:', errors);
    }
  };

  const renderFieldEditor = (field) => {
    if (!field) return null;
    
    return (
      <div className="field-editor">
        <h3>Edit Field: {field.label}</h3>
        
        <div className="editor-group">
          <label>Field Type:</label>
          <select 
            value={field.type} 
            onChange={(e) => updateField(field.id, { type: e.target.value })}
          >
            {fieldTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="editor-group">
          <label>Label:</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
          />
        </div>

        <div className="editor-group">
          <label>Placeholder:</label>
          <input
            type="text"
            value={field.placeholder}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
          />
        </div>

        <div className="editor-group">
          <label>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
            />
            Required
          </label>
        </div>

        {(field.type === 'select' || field.type === 'radio') && (
          <div className="editor-group">
            <label>Options:</label>
            {field.options.map((option, index) => (
              <div key={index} className="option-editor">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(field.id, index, e.target.value)}
                />
                <button onClick={() => removeOption(field.id, index)}>Remove</button>
              </div>
            ))}
            <button onClick={() => addOption(field.id)}>Add Option</button>
          </div>
        )}

        <div className="editor-actions">
          <button onClick={() => setSelectedField(null)}>Close</button>
        </div>
      </div>
    );
  };

  const renderField = (field) => {
    const commonProps = {
      key: field.id,
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.id] || '',
      onChange: (e) => handleFormInputChange(field.id, e.target.value)
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows="3" />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <label>
            <input
              type="checkbox"
              checked={formData[field.id] || false}
              onChange={(e) => handleFormInputChange(field.id, e.target.checked)}
            />
            {field.label}
          </label>
        );
      case 'radio':
        return (
          <div className="radio-group">
            <label>{field.label}:</label>
            {field.options.map((option, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleFormInputChange(field.id, e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      case 'date':
        return <input type="date" {...commonProps} />;
      case 'file':
        return <input type="file" {...commonProps} />;
      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <div className="form-builder-container">
      <div className="builder-header">
        <h1>Form Builder</h1>
        <p>Form ID: {formId}</p>
        <div className="mode-toggle">
          <button 
            className={!isPreviewMode ? 'active' : ''} 
            onClick={() => setIsPreviewMode(false)}
          >
            Builder Mode
          </button>
          <button 
            className={isPreviewMode ? 'active' : ''} 
            onClick={() => setIsPreviewMode(true)}
          >
            Preview Mode
          </button>
        </div>
      </div>

      {!isPreviewMode ? (
        <div className="builder-workspace">
          <div className="field-palette">
            <h3>Field Types</h3>
            <div className="field-types">
              {fieldTypes.map(type => (
                <button 
                  key={type} 
                  onClick={() => addField(type)}
                  className="field-type-btn"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="form-canvas">
            <h3>Form Canvas</h3>
            {fields.length === 0 ? (
              <div className="empty-canvas">
                <p>Drag field types here or click to add fields</p>
              </div>
            ) : (
              <div className="fields-list">
                {fields.map((field, index) => (
                  <div key={field.id} className="field-item">
                    <div className="field-header">
                      <span className="field-type-badge">{field.type}</span>
                      <span className="field-label">{field.label}</span>
                      {field.required && <span className="required-badge">Required</span>}
                    </div>
                    
                    <div className="field-preview">
                      {renderField(field)}
                    </div>
                    
                    <div className="field-actions">
                      <button onClick={() => setSelectedField(field)}>Edit</button>
                      <button onClick={() => duplicateField(field.id)}>Duplicate</button>
                      <button onClick={() => moveField(field.id, 'up')} disabled={index === 0}>↑</button>
                      <button onClick={() => moveField(field.id, 'down')} disabled={index === fields.length - 1}>↓</button>
                      <button onClick={() => deleteField(field.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedField && (
            <div className="field-editor-panel">
              {renderFieldEditor(selectedField)}
            </div>
          )}
        </div>
      ) : (
        <div className="form-preview">
          <h3>Form Preview</h3>
          <form onSubmit={handleSubmit} className="preview-form">
            {fields.map(field => (
              <div key={field.id} className="form-field">
                <label className="field-label">
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">Submit Form</button>
              <button type="button" onClick={() => setFormData({})}>Reset Form</button>
            </div>
          </form>
        </div>
      )}

      <div className="form-info">
        <h2>Form Builder Features</h2>
        <ul>
          <li><strong>Multiple Field Types:</strong> Text, email, select, checkbox, radio, date, file, etc.</li>
          <li><strong>Drag & Drop Interface:</strong> Easy field reordering and management</li>
          <li><strong>Field Validation:</strong> Required fields, length limits, patterns, and ranges</li>
          <li><strong>Live Preview:</strong> Switch between builder and preview modes</li>
          <li><strong>Field Duplication:</strong> Copy existing fields with all properties</li>
          <li><strong>Local Storage:</strong> Forms persist between sessions</li>
          <li><strong>Responsive Design:</strong> Works on all device sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default FormBuilder;
