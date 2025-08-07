import { createTask } from '../utils/helpers';

export const sampleTasks = [
  createTask({
    title: 'Complete Project Proposal',
    description: 'Finish the project proposal document for the new client. Include budget estimates, timeline, and deliverables.',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['proposal', 'client', 'documentation']
  }),
  
  createTask({
    title: 'Review Code Changes',
    description: 'Review the pull request for the new authentication feature. Check for security issues and code quality.',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['code-review', 'security', 'authentication']
  }),
  
  createTask({
    title: 'Buy Groceries',
    description: 'Purchase groceries for the week. Don\'t forget milk, bread, vegetables, and protein.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    category: 'personal',
    assignedTo: 'John Doe',
    tags: ['shopping', 'groceries', 'weekly']
  }),
  
  createTask({
    title: 'Schedule Dentist Appointment',
    description: 'Call the dentist office to schedule a routine checkup and cleaning.',
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    category: 'health',
    assignedTo: 'John Doe',
    tags: ['health', 'appointment', 'dental']
  }),
  
  createTask({
    title: 'Update Portfolio Website',
    description: 'Add recent projects to portfolio website and update the design to match current trends.',
    priority: 'medium',
    status: 'completed',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['portfolio', 'website', 'design']
  }),
  
  createTask({
    title: 'Learn React Hooks',
    description: 'Complete the React Hooks tutorial and practice with small examples to understand the concepts better.',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    category: 'education',
    assignedTo: 'John Doe',
    tags: ['react', 'hooks', 'learning', 'javascript']
  }),
  
  createTask({
    title: 'Plan Weekend Trip',
    description: 'Research and plan a weekend trip to the nearby mountains. Book accommodation and plan activities.',
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    category: 'personal',
    assignedTo: 'John Doe',
    tags: ['travel', 'weekend', 'planning']
  }),
  
  createTask({
    title: 'Fix Bug in Login System',
    description: 'Investigate and fix the authentication bug that\'s causing users to be logged out unexpectedly.',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['bug-fix', 'authentication', 'urgent']
  }),
  
  createTask({
    title: 'Read Programming Book',
    description: 'Continue reading "Clean Code" by Robert C. Martin. Focus on chapters about function design and error handling.',
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    category: 'education',
    assignedTo: 'John Doe',
    tags: ['reading', 'programming', 'clean-code']
  }),
  
  createTask({
    title: 'Organize Desk',
    description: 'Clean and organize the workspace. Sort through papers, organize cables, and declutter the desk area.',
    priority: 'low',
    status: 'completed',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    category: 'personal',
    assignedTo: 'John Doe',
    tags: ['organization', 'cleaning', 'workspace']
  }),
  
  createTask({
    title: 'Prepare Team Meeting',
    description: 'Prepare agenda and materials for the weekly team meeting. Include project updates and discussion topics.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['meeting', 'team', 'agenda']
  }),
  
  createTask({
    title: 'Exercise Routine',
    description: 'Complete the daily exercise routine including cardio, strength training, and stretching exercises.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    category: 'health',
    assignedTo: 'John Doe',
    tags: ['exercise', 'health', 'daily']
  }),
  
  createTask({
    title: 'Backup Important Files',
    description: 'Create backup copies of important project files and documents to external storage.',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['backup', 'files', 'security']
  }),
  
  createTask({
    title: 'Call Mom',
    description: 'Call mom to catch up and see how she\'s doing. Don\'t forget to ask about her recent trip.',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    category: 'personal',
    assignedTo: 'John Doe',
    tags: ['family', 'call', 'personal']
  }),
  
  createTask({
    title: 'Update Resume',
    description: 'Update resume with recent projects and achievements. Add new skills and certifications.',
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    category: 'work',
    assignedTo: 'John Doe',
    tags: ['resume', 'career', 'update']
  })
]; 