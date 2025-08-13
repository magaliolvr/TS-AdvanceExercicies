import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = ({ userId = 'user123', initialData = {} }) => {
  const [profileData, setProfileData] = useState({
    name: initialData.name || 'John Doe',
    email: initialData.email || 'john@example.com',
    bio: initialData.bio || 'No bio available',
    skills: initialData.skills || ['JavaScript', 'React', 'Node.js'],
    isEditing: false,
    showSkills: true
  });

  const [formErrors, setFormErrors] = useState({});

  const handleEditToggle = () => {
    setProfileData(prev => ({ ...prev, isEditing: !prev.isEditing }));
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
    const errors = {};
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    if (!profileData.email.includes('@')) errors.email = 'Invalid email format';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setProfileData(prev => ({ ...prev, isEditing: false }));
  };

  const toggleSkills = () => {
    setProfileData(prev => ({ ...prev, showSkills: !prev.showSkills }));
  };

  const addSkill = (skill) => {
    if (skill.trim() && !profileData.skills.includes(skill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p>User ID: {userId}</p>
        <div className="profile-actions">
          <button onClick={handleEditToggle} className="profile-button">
            {profileData.isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          {profileData.isEditing && (
            <button onClick={handleSave} className="profile-button primary">
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          
          <div className="profile-item">
            <label>Name:</label>
            {profileData.isEditing ? (
              <div className="input-group">
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
            ) : (
              <span className="profile-value">{profileData.name}</span>
            )}
          </div>

          <div className="profile-item">
            <label>Email:</label>
            {profileData.isEditing ? (
              <div className="input-group">
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
            ) : (
              <span className="profile-value">{profileData.email}</span>
            )}
          </div>

          <div className="profile-item">
            <label>Bio:</label>
            {profileData.isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows="3"
              />
            ) : (
              <span className="profile-value">{profileData.bio}</span>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Skills & Expertise</h2>
            <button onClick={toggleSkills} className="toggle-button">
              {profileData.showSkills ? 'Hide' : 'Show'} Skills
            </button>
          </div>
          
          {profileData.showSkills && (
            <div className="skills-container">
              <div className="skills-list">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                    {profileData.isEditing && (
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="remove-skill"
                      >
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <small>Press Enter to add skill</small>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-stats">
          <h2>Profile Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{profileData.skills.length}</span>
              <span className="stat-label">Skills</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profileData.bio.length}</span>
              <span className="stat-label">Bio Characters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{profileData.isEditing ? 'Editing' : 'Viewing'}</span>
              <span className="stat-label">Current Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
