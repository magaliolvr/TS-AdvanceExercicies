import React, { useState } from "react";
import "./UserProfile.css";

// TypeScript interfaces for component props and data
interface UserProfileProps {
	userId?: string;
	initialData?: Partial<UserData>;
}

interface UserData {
	name: string;
	email: string;
	bio: string;
	skills: string[];
	isEditing: boolean;
	showSkills: boolean;
}

interface FormErrors {
	name?: string;
	email?: string;
}

const UserProfileTS: React.FC<UserProfileProps> = ({
	userId = "user123",
	initialData = {},
}) => {
	// TypeScript state with explicit typing
	const [profileData, setProfileData] = useState<UserData>({
		name: initialData.name || "John Doe",
		email: initialData.email || "john@example.com",
		bio: initialData.bio || "No bio available",
		skills: initialData.skills || ["JavaScript", "React", "Node.js"],
		isEditing: false,
		showSkills: true,
	});
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const [newSkill, setNewSkill] = useState<string>("");

	// TypeScript event handlers with explicit return types
	const handleEditToggle = (): void => {
		setProfileData((prev: UserData) => ({
			...prev,
			isEditing: !prev.isEditing,
		}));
		setFormErrors({});
	};

	const handleSave = (): void => {
		const errors: FormErrors = {};
		if (!profileData.name.trim()) errors.name = "Name is required";
		if (!profileData.email.trim()) errors.email = "Email is required";
		if (!profileData.email.includes("@")) errors.email = "Invalid email format";

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		setProfileData((prev: UserData) => ({ ...prev, isEditing: false }));
		setFormErrors({});
	};

	const handleInputChange = (field: keyof UserData, value: string): void => {
		setProfileData((prev: UserData) => ({ ...prev, [field]: value }));
	};

	const addSkill = (skill: string): void => {
		if (skill.trim() && !profileData.skills.includes(skill.trim())) {
			setProfileData((prev: UserData) => ({
				...prev,
				skills: [...prev.skills, skill.trim()],
			}));
		}
	};

	const removeSkill = (skillToRemove: string): void => {
		setProfileData((prev: UserData) => ({
			...prev,
			skills: prev.skills.filter((skill: string) => skill !== skillToRemove),
		}));
	};

	const toggleSkills = (): void => {
		setProfileData((prev: UserData) => ({
			...prev,
			showSkills: !prev.showSkills,
		}));
	};

	// TypeScript ensures type safety for event handlers
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Enter") {
			addSkill(e.currentTarget.value);
			e.currentTarget.value = "";
		}
	};

	return (
		<div className="user-profile">
			<div className="profile-header">
				<h2>User Profile</h2>
				<p>User ID: {userId}</p>
			</div>

			<div className="profile-content">
				<div className="profile-section">
					<div className="profile-actions">
						<button onClick={handleEditToggle} className="profile-button">
							{profileData.isEditing ? "Cancel" : "Edit Profile"}
						</button>
						{profileData.isEditing && (
							<button onClick={handleSave} className="save-button">
								Save Changes
							</button>
						)}
					</div>

					{profileData.isEditing ? (
						<div className="profile-form">
							<div className="form-group">
								<label>Name:</label>
								<input
									type="text"
									value={profileData.name}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange("name", e.target.value)
									}
									className={formErrors.name ? "error" : ""}
								/>
								{formErrors.name && (
									<span className="error-message">{formErrors.name}</span>
								)}
							</div>

							<div className="form-group">
								<label>Email:</label>
								<input
									type="email"
									value={profileData.email}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange("email", e.target.value)
									}
									className={formErrors.email ? "error" : ""}
								/>
								{formErrors.email && (
									<span className="error-message">{formErrors.email}</span>
								)}
							</div>

							<div className="form-group">
								<label>Bio:</label>
								<textarea
									value={profileData.bio}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										handleInputChange("bio", e.target.value)
									}
									rows={3}
								/>
							</div>
						</div>
					) : (
						<div className="profile-display">
							<div className="profile-info">
								<h3>{profileData.name}</h3>
								<p className="profile-email">{profileData.email}</p>
								<p className="profile-bio">{profileData.bio}</p>
							</div>
						</div>
					)}
				</div>

				<div className="profile-section">
					<div className="skills-header">
						<h2>Skills & Expertise</h2>
						<button onClick={toggleSkills} className="toggle-button">
							{profileData.showSkills ? "Hide" : "Show"} Skills
						</button>
					</div>

					{profileData.showSkills && (
						<div className="skills-section">
							<div className="skills-list">
								{profileData.skills.map((skill: string, index: number) => (
									<div key={index} className="skill-item">
										<span className="skill-name">{skill}</span>
										{profileData.isEditing && (
											<button
												onClick={() => removeSkill(skill)}
												className="remove-skill">
												×
											</button>
										)}
									</div>
								))}
							</div>

							{profileData.isEditing && (
								<div className="add-skill">
									<input
										type="text"
										placeholder="Add new skill"
										value={newSkill}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setNewSkill(e.target.value)
										}
										onKeyPress={handleKeyPress}
									/>
									<button onClick={() => addSkill(newSkill)}>Add</button>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="profile-stats">
					<div className="stat-item">
						<span className="stat-number">{profileData.skills.length}</span>
						<span className="stat-label">Skills</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">
							{profileData.isEditing ? "Editing" : "Viewing"}
						</span>
						<span className="stat-label">Current Mode</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{profileData.name.length}</span>
						<span className="stat-label">Name Length</span>
					</div>
				</div>
			</div>

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All state variables have defined types
					</li>
					<li>
						<strong>Interface Contracts:</strong> Props and data structures are
						clearly defined
					</li>
					<li>
						<strong>Event Handler Types:</strong> React events are properly
						typed
					</li>
					<li>
						<strong>Generic State:</strong> useState hooks use explicit typing
					</li>
					<li>
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default UserProfileTS;
