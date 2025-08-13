import React, { useState, useEffect } from "react";
import "./FormBuilder.css";

// TypeScript interfaces for component props and data
interface FormBuilderProps {
	formId?: string;
	initialFields?: FormField[];
}

interface FormField {
	id: string;
	type: FieldType;
	label: string;
	placeholder: string;
	required: boolean;
	options: string[];
	validation: FieldValidation;
}

type FieldType =
	| "text"
	| "email"
	| "password"
	| "number"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio"
	| "date"
	| "file";

interface FieldValidation {
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	pattern?: "email" | string;
}

interface FormData {
	[key: string]: any;
}

const FormBuilderTS: React.FC<FormBuilderProps> = ({
	formId = "form1",
	initialFields = [],
}) => {
	// TypeScript state with explicit typing
	const [fields, setFields] = useState<FormField[]>(initialFields);
	const [formData, setFormData] = useState<FormData>({});
	const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
	const [selectedField, setSelectedField] = useState<FormField | null>(null);
	const [fieldTypes] = useState<FieldType[]>([
		"text",
		"email",
		"password",
		"number",
		"textarea",
		"select",
		"checkbox",
		"radio",
		"date",
		"file",
	]);

	// Load form from localStorage on component mount
	useEffect(() => {
		const savedForm = localStorage.getItem(`form_${formId}`);
		if (savedForm && initialFields.length === 0) {
			try {
				const parsedForm: { fields: FormField[]; formData: FormData } =
					JSON.parse(savedForm);
				setFields(parsedForm.fields || []);
				setFormData(parsedForm.formData || {});
			} catch (error) {
				console.error("Error parsing saved form:", error);
			}
		}
	}, [formId, initialFields]);

	// Save form to localStorage
	useEffect(() => {
		localStorage.setItem(
			`form_${formId}`,
			JSON.stringify({ fields, formData })
		);
	}, [fields, formData, formId]);

	// Add a new field
	const addField = (type: FieldType): void => {
		const newField: FormField = {
			id: `field_${Date.now()}`,
			type,
			label: `New ${type} field`,
			placeholder: `Enter ${type}`,
			required: false,
			options:
				type === "select" || type === "radio" ? ["Option 1", "Option 2"] : [],
			validation: {
				minLength: type === "text" || type === "textarea" ? 0 : undefined,
				maxLength: type === "text" || type === "textarea" ? 100 : undefined,
				min: type === "number" ? undefined : undefined,
				max: type === "number" ? undefined : undefined,
				pattern: type === "email" ? "email" : undefined,
			},
		};
		setFields((prev: FormField[]) => [...prev, newField]);
	};

	// Update a field
	const updateField = (fieldId: string, updates: Partial<FormField>): void => {
		setFields((prev: FormField[]) =>
			prev.map((field: FormField) =>
				field.id === fieldId ? { ...field, ...updates } : field
			)
		);
	};

	// Delete a field
	const deleteField = (fieldId: string): void => {
		setFields((prev: FormField[]) =>
			prev.filter((field: FormField) => field.id !== fieldId)
		);
		setFormData((prev: FormData) => {
			const newData: FormData = { ...prev };
			delete newData[fieldId];
			return newData;
		});
	};

	// Duplicate a field
	const duplicateField = (fieldId: string): void => {
		const fieldToDuplicate: FormField | undefined = fields.find(
			(f: FormField) => f.id === fieldId
		);
		if (fieldToDuplicate) {
			const duplicatedField: FormField = {
				...fieldToDuplicate,
				id: `field_${Date.now()}`,
				label: `${fieldToDuplicate.label} (Copy)`,
			};
			setFields((prev: FormField[]) => [...prev, duplicatedField]);
		}
	};

	// Move a field up or down
	const moveField = (fieldId: string, direction: "up" | "down"): void => {
		setFields((prev: FormField[]) => {
			const currentIndex: number = prev.findIndex(
				(f: FormField) => f.id === fieldId
			);
			if (currentIndex === -1) return prev;

			const newIndex: number =
				direction === "up" ? currentIndex - 1 : currentIndex + 1;
			if (newIndex < 0 || newIndex >= prev.length) return prev;

			const newFields: FormField[] = [...prev];
			[newFields[currentIndex], newFields[newIndex]] = [
				newFields[newIndex],
				newFields[currentIndex],
			];
			return newFields;
		});
	};

	// Add an option to select/radio fields
	const addOption = (fieldId: string): void => {
		const field: FormField | undefined = fields.find(
			(f: FormField) => f.id === fieldId
		);
		if (field) {
			updateField(fieldId, {
				options: [...field.options, `Option ${field.options.length + 1}`],
			});
		}
	};

	// Remove an option from select/radio fields
	const removeOption = (fieldId: string, optionIndex: number): void => {
		const field: FormField | undefined = fields.find(
			(f: FormField) => f.id === fieldId
		);
		if (field) {
			const newOptions: string[] = field.options.filter(
				(_, index: number) => index !== optionIndex
			);
			updateField(fieldId, { options: newOptions });
		}
	};

	// Update an option value
	const updateOption = (
		fieldId: string,
		optionIndex: number,
		value: string
	): void => {
		const field: FormField | undefined = fields.find(
			(f: FormField) => f.id === fieldId
		);
		if (field) {
			const newOptions: string[] = [...field.options];
			newOptions[optionIndex] = value;
			updateField(fieldId, { options: newOptions });
		}
	};

	// Handle form input changes
	const handleFormInputChange = (fieldId: string, value: any): void => {
		setFormData((prev: FormData) => ({ ...prev, [fieldId]: value }));
	};

	// Validate the form
	const validateForm = (): Record<string, string> => {
		const errors: Record<string, string> = {};
		fields.forEach((field: FormField) => {
			if (
				field.required &&
				(!formData[field.id] || formData[field.id].toString().trim() === "")
			) {
				errors[field.id] = `${field.label} is required`;
			}

			if (formData[field.id]) {
				const value: any = formData[field.id];

				if (
					field.validation.minLength !== undefined &&
					value.length < field.validation.minLength
				) {
					errors[
						field.id
					] = `${field.label} must be at least ${field.validation.minLength} characters`;
				}

				if (
					field.validation.maxLength !== undefined &&
					value.length > field.validation.maxLength
				) {
					errors[
						field.id
					] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
				}

				if (
					field.validation.min !== undefined &&
					value < field.validation.min
				) {
					errors[
						field.id
					] = `${field.label} must be at least ${field.validation.min}`;
				}

				if (
					field.validation.max !== undefined &&
					value > field.validation.max
				) {
					errors[
						field.id
					] = `${field.label} must be no more than ${field.validation.max}`;
				}

				if (
					field.validation.pattern === "email" &&
					!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
				) {
					errors[field.id] = `${field.label} must be a valid email address`;
				}
			}
		});
		return errors;
	};

	// Submit the form
	const handleSubmit = (): void => {
		const errors: Record<string, string> = validateForm();
		if (Object.keys(errors).length === 0) {
			alert("Form submitted successfully!");
			console.log("Form data:", formData);
		} else {
			alert("Please fix the errors in the form");
			console.log("Validation errors:", errors);
		}
	};

	// Render field editor
	const renderFieldEditor = (field: FormField) => (
		<div className="field-editor">
			<h3>Edit Field: {field.label}</h3>
			<div className="editor-group">
				<label>Field Type:</label>
				<select
					value={field.type}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						updateField(field.id, { type: e.target.value as FieldType })
					}>
					{fieldTypes.map((type: FieldType) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>

			<div className="editor-group">
				<label>Label:</label>
				<input
					type="text"
					value={field.label}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						updateField(field.id, { label: e.target.value })
					}
				/>
			</div>

			<div className="editor-group">
				<label>Placeholder:</label>
				<input
					type="text"
					value={field.placeholder}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						updateField(field.id, { placeholder: e.target.value })
					}
				/>
			</div>

			<div className="editor-group">
				<label>
					<input
						type="checkbox"
						checked={field.required}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							updateField(field.id, { required: e.target.checked })
						}
					/>
					Required
				</label>
			</div>

			{(field.type === "select" || field.type === "radio") && (
				<div className="editor-group">
					<label>Options:</label>
					{field.options.map((option: string, index: number) => (
						<div key={index} className="option-item">
							<input
								type="text"
								value={option}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									updateOption(field.id, index, e.target.value)
								}
							/>
							<button onClick={() => removeOption(field.id, index)}>
								Remove
							</button>
						</div>
					))}
					<button onClick={() => addOption(field.id)}>Add Option</button>
				</div>
			)}
		</div>
	);

	// Render a form field
	const renderField = (field: FormField) => {
		const commonProps = {
			id: field.id,
			placeholder: field.placeholder,
			required: field.required,
			value: formData[field.id] || "",
			onChange: (
				e: React.ChangeEvent<
					HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
				>
			) => handleFormInputChange(field.id, e.target.value),
		};

		switch (field.type) {
			case "textarea":
				return <textarea {...commonProps} rows={3} />;
			case "select":
				return (
					<select {...commonProps}>
						<option value="">Select an option</option>
						{field.options.map((option: string, index: number) => (
							<option key={index} value={option}>
								{option}
							</option>
						))}
					</select>
				);
			case "checkbox":
				return (
					<label>
						<input
							type="checkbox"
							checked={formData[field.id] || false}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleFormInputChange(field.id, e.target.checked)
							}
						/>
						{field.label}
					</label>
				);
			case "radio":
				return (
					<div className="radio-group">
						{field.options.map((option: string, index: number) => (
							<label key={index}>
								<input
									type="radio"
									name={field.id}
									value={option}
									checked={formData[field.id] === option}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleFormInputChange(field.id, e.target.value)
									}
								/>
								{option}
							</label>
						))}
					</div>
				);
			case "date":
				return <input type="date" {...commonProps} />;
			case "file":
				return <input type="file" {...commonProps} />;
			default:
				return <input type={field.type} {...commonProps} />;
		}
	};

	return (
		<div className="form-builder">
			<div className="builder-header">
				<h2>Form Builder</h2>
				<p>Create dynamic forms with TypeScript</p>
			</div>

			<div className="mode-toggle">
				<button
					className={!isPreviewMode ? "active" : ""}
					onClick={() => setIsPreviewMode(false)}>
					Builder Mode
				</button>
				<button
					className={isPreviewMode ? "active" : ""}
					onClick={() => setIsPreviewMode(true)}>
					Preview Mode
				</button>
			</div>

			{!isPreviewMode ? (
				<div className="builder-mode">
					<div className="field-types">
						{fieldTypes.map((type: FieldType) => (
							<button
								key={type}
								onClick={() => addField(type)}
								className="field-type-btn">
								{type}
							</button>
						))}
					</div>

					<div className="fields-list">
						{fields.map((field: FormField, index: number) => (
							<div key={field.id} className="field-item">
								<div className="field-header">
									<span className="field-type-badge">{field.type}</span>
									<span className="field-label">{field.label}</span>
									{field.required && (
										<span className="required-badge">Required</span>
									)}
								</div>

								<div className="field-preview">{renderField(field)}</div>

								<div className="field-actions">
									<button onClick={() => setSelectedField(field)}>Edit</button>
									<button onClick={() => duplicateField(field.id)}>
										Duplicate
									</button>
									<button
										onClick={() => moveField(field.id, "up")}
										disabled={index === 0}>
										↑
									</button>
									<button
										onClick={() => moveField(field.id, "down")}
										disabled={index === fields.length - 1}>
										↓
									</button>
									<button
										onClick={() => deleteField(field.id)}
										className="delete-btn">
										Delete
									</button>
								</div>
							</div>
						))}
					</div>

					{selectedField && (
						<div className="field-editor-panel">
							{renderFieldEditor(selectedField)}
						</div>
					)}
				</div>
			) : (
				<div className="preview-mode">
					<form onSubmit={(e) => e.preventDefault()}>
						{fields.map((field: FormField) => (
							<div key={field.id} className="form-field">
								<label htmlFor={field.id}>
									{field.label}
									{field.required && <span className="required">*</span>}
								</label>
								{renderField(field)}
							</div>
						))}
						<button type="submit" onClick={handleSubmit}>
							Submit Form
						</button>
					</form>
				</div>
			)}

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All field properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Field types use specific string
						literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for form
						fields and validation
					</li>
					<li>
						<strong>Generic State:</strong> useState hooks with explicit typing
					</li>
					<li>
						<strong>Event Handler Types:</strong> React events are properly
						typed
					</li>
					<li>
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default FormBuilderTS;
