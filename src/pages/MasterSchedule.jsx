import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';

export default function MasterSchedule() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    milestone: '',
    target_date: '',
    status: 'not_started',
    notes: ''
  });
  
  const navigate = useNavigate();

  // Load user and milestones
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        setUserId(user.id);
        
        // Fetch retirement milestones
        const { data, error } = await supabase
          .from('retirement_schedule')
          .select('*')
          .eq('user_id', user.id)
          .order('target_date', { ascending: true });
        
        if (error) {
          throw new Error(error.message);
        }
        
        setMilestones(data || []);
        
        // If no milestones exist, create default ones
        if (!data || data.length === 0) {
          await createDefaultMilestones(user.id);
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        toast.error("Failed to load retirement schedule");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);
  
  // Create default milestones for new users
  const createDefaultMilestones = async (userId) => {
    try {
      // Get user retirement year
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('retirement_year_estimate')
        .eq('id', userId)
        .single();
      
      if (userError) {
        throw new Error(userError.message);
      }
      
      const retirementYear = userData?.retirement_year_estimate || new Date().getFullYear() + 5;
      const currentYear = new Date().getFullYear();
      const yearsToRetirement = retirementYear - currentYear;
      
      // Default milestones
      const defaultMilestones = [
        {
          user_id: userId,
          milestone: 'Research Potential Locations',
          target_date: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          status: 'in_progress',
          notes: 'Explore towns using Scout2Retire and create a shortlist of favorites.'
        },
        {
          user_id: userId,
          milestone: 'Visit Top 3 Locations',
          target_date: new Date(currentYear + Math.max(1, Math.floor(yearsToRetirement * 0.3)), 0, 1).toISOString().split('T')[0],
          status: 'not_started',
          notes: 'Plan trips to experience the lifestyle in each location.'
        },
        {
          user_id: userId,
          milestone: 'Financial Planning',
          target_date: new Date(currentYear + Math.max(1, Math.floor(yearsToRetirement * 0.5)), 0, 1).toISOString().split('T')[0],
          status: 'not_started',
          notes: 'Meet with financial advisor to finalize retirement budget and savings plan.'
        },
        {
          user_id: userId,
          milestone: 'Housing Decision',
          target_date: new Date(currentYear + Math.max(1, Math.floor(yearsToRetirement * 0.7)), 0, 1).toISOString().split('T')[0],
          status: 'not_started',
          notes: 'Decide whether to rent or buy in chosen location.'
        },
        {
          user_id: userId,
          milestone: 'Visa/Immigration Paperwork',
          target_date: new Date(retirementYear - 1, 0, 1).toISOString().split('T')[0],
          status: 'not_started',
          notes: 'Start paperwork for residence permits or visas if moving internationally.'
        },
        {
          user_id: userId,
          milestone: 'Moving Day!',
          target_date: new Date(retirementYear, 0, 1).toISOString().split('T')[0],
          status: 'not_started',
          notes: 'Begin your new life in your chosen retirement location.'
        }
      ];
      
      // Insert default milestones
      const { error } = await supabase
        .from('retirement_schedule')
        .insert(defaultMilestones);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update state with new milestones
      setMilestones(defaultMilestones);
    } catch (err) {
      console.error("Error creating default milestones:", err);
      toast.error("Failed to create default schedule");
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle milestone status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('retirement_schedule')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.id === id ? { ...milestone, status: newStatus } : milestone
        )
      );
      
      toast.success("Milestone status updated");
    } catch (err) {
      console.error("Error updating milestone status:", err);
      toast.error("Failed to update milestone status");
    }
  };
  
  // Handle adding a new milestone
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    
    try {
      const newMilestone = {
        user_id: userId,
        milestone: formData.milestone,
        target_date: formData.target_date,
        status: formData.status,
        notes: formData.notes
      };
      
      const { data, error } = await supabase
        .from('retirement_schedule')
        .insert([newMilestone])
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setMilestones(prev => [...prev, data[0]]);
      
      // Reset form and hide it
      setFormData({
        milestone: '',
        target_date: '',
        status: 'not_started',
        notes: ''
      });
      setShowAddForm(false);
      
      toast.success("Milestone added successfully");
    } catch (err) {
      console.error("Error adding milestone:", err);
      toast.error("Failed to add milestone");
    }
  };
  
  // Handle updating a milestone
  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('retirement_schedule')
        .update({
          milestone: formData.milestone,
          target_date: formData.target_date,
          status: formData.status,
          notes: formData.notes
        })
        .eq('id', editingMilestone.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setMilestones(prev => 
        prev.map(milestone => 
          milestone.id === editingMilestone.id 
            ? { 
                ...milestone, 
                milestone: formData.milestone,
                target_date: formData.target_date,
                status: formData.status,
                notes: formData.notes
              } 
            : milestone
        )
      );
      
      // Reset form and hide it
      setEditingMilestone(null);
      setShowEditForm(false);
      
      toast.success("Milestone updated successfully");
    } catch (err) {
      console.error("Error updating milestone:", err);
      toast.error("Failed to update milestone");
    }
  };
  
  // Start editing a milestone
  const handleEditStart = (milestone) => {
    setFormData({
      milestone: milestone.milestone,
      target_date: milestone.target_date,
      status: milestone.status,
      notes: milestone.notes || ''
    });
    setEditingMilestone(milestone);
    setShowEditForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle deleting a milestone
  const handleDeleteMilestone = async (id) => {
    if (!confirm("Are you sure you want to delete this milestone?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('retirement_schedule')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setMilestones(prev => prev.filter(milestone => milestone.id !== id));
      
      toast.success("Milestone deleted successfully");
    } catch (err) {
      console.error("Error deleting milestone:", err);
      toast.error("Failed to delete milestone");
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'not_started':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            Not Started
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
            Completed
          </span>
        );
      default:
        return null;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading your retirement schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Retirement Master Schedule
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Your Milestones
          </h2>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowEditForm(false);
              setFormData({
                milestone: '',
                target_date: '',
                status: 'not_started',
                notes: ''
              });
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            {showAddForm ? 'Cancel' : 'Add Milestone'}
          </button>
        </div>
        
        {/* Add milestone form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Add New Milestone
            </h3>
            
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label htmlFor="milestone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Milestone Name
                </label>
                <input
                  id="milestone"
                  name="milestone"
                  type="text"
                  value={formData.milestone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date
                </label>
                <input
                  id="target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Add Milestone
              </button>
            </form>
          </div>
        )}
        
        {/* Edit milestone form */}
        {showEditForm && editingMilestone && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Edit Milestone
            </h3>
            
            <form onSubmit={handleUpdateMilestone} className="space-y-4">
              <div>
                <label htmlFor="edit_milestone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Milestone Name
                </label>
                <input
                  id="edit_milestone"
                  name="milestone"
                  type="text"
                  value={formData.milestone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit_target_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date
                </label>
                <input
                  id="edit_target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="edit_status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="edit_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="edit_notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Update Milestone
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Milestones list */}
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No milestones found. Add some to start planning your retirement journey!
              </p>
            </div>
          ) : (
            milestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 ${
                  milestone.status === 'completed' 
                    ? 'border-green-600 dark:border-green-500' 
                    : milestone.status === 'in_progress'
                    ? 'border-blue-600 dark:border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 md:mb-0">
                      {milestone.milestone}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(milestone.status)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(milestone.target_date)}
                      </span>
                    </div>
                  </div>
                  
                  {milestone.notes && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {milestone.notes}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Status change buttons */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {milestone.status !== 'not_started' && (
                          <button
                            onClick={() => handleStatusChange(milestone.id, 'not_started')}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Mark Not Started
                          </button>
                        )}
                        
                        {milestone.status !== 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(milestone.id, 'in_progress')}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        
                        {milestone.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(milestone.id, 'completed')}
                            className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Edit/Delete buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStart(milestone)}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Tips section */}
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
            Tips for Planning Your Retirement Timeline
          </h3>
          
          <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
            <li>• Start researching potential locations at least 5 years before your planned retirement date.</li>
            <li>• Visit your top choices during different seasons to experience the full climate cycle.</li>
            <li>• Begin visa and immigration paperwork at least 12-18 months before your planned move.</li>
            <li>• Consider a "trial retirement" by spending 2-3 months in your chosen location before making a permanent move.</li>
            <li>• Plan your healthcare transition well in advance, especially for international moves.</li>
          </ul>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <QuickNav />
    </div>
  );
}