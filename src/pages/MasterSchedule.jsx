import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

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
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${uiConfig.colors.statusInfo}`}>
            Not Started
          </span>
        );
      case 'in_progress':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${uiConfig.colors.statusInfo}`}>
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${uiConfig.colors.statusSuccess}`}>
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold`}>Loading your retirement schedule...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      {/* Header */}
      <header className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm}`}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className={`text-xl font-bold ${uiConfig.colors.heading}`}>
            Retirement Master Schedule
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
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
            className={`px-4 py-2 ${uiConfig.colors.btnPrimary} rounded-md text-sm`}
          >
            {showAddForm ? 'Cancel' : 'Add Milestone'}
          </button>
        </div>
        
        {/* Add milestone form */}
        {showAddForm && (
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
              Add New Milestone
            </h3>
            
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label htmlFor="milestone" className={uiConfig.components.label}>
                  Milestone Name
                </label>
                <input
                  id="milestone"
                  name="milestone"
                  type="text"
                  value={formData.milestone}
                  onChange={handleInputChange}
                  className={uiConfig.components.input}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="target_date" className={uiConfig.components.label}>
                  Target Date
                </label>
                <input
                  id="target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className={uiConfig.components.input}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className={uiConfig.components.label}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={uiConfig.components.select}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="notes" className={uiConfig.components.label}>
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={uiConfig.components.textarea}
                ></textarea>
              </div>
              
              <button
                type="submit"
                className={`w-full ${uiConfig.colors.btnPrimary} font-medium py-2 px-4 rounded-md`}
              >
                Add Milestone
              </button>
            </form>
          </div>
        )}
        
        {/* Edit milestone form */}
        {showEditForm && editingMilestone && (
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
            <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
              Edit Milestone
            </h3>
            
            <form onSubmit={handleUpdateMilestone} className="space-y-4">
              <div>
                <label htmlFor="edit_milestone" className={uiConfig.components.label}>
                  Milestone Name
                </label>
                <input
                  id="edit_milestone"
                  name="milestone"
                  type="text"
                  value={formData.milestone}
                  onChange={handleInputChange}
                  className={uiConfig.components.input}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit_target_date" className={uiConfig.components.label}>
                  Target Date
                </label>
                <input
                  id="edit_target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className={uiConfig.components.input}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit_status" className={uiConfig.components.label}>
                  Status
                </label>
                <select
                  id="edit_status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={uiConfig.components.select}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="edit_notes" className={uiConfig.components.label}>
                  Notes (Optional)
                </label>
                <textarea
                  id="edit_notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={uiConfig.components.textarea}
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className={`flex-1 ${uiConfig.colors.btnPrimary} font-medium py-2 px-4 rounded-md`}
                >
                  Update Milestone
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className={`flex-1 ${uiConfig.colors.btnSecondary} font-medium py-2 px-4 rounded-md`}
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
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card} text-center`}>
              <p className={uiConfig.colors.body}>
                No milestones found. Add some to start planning your retirement journey!
              </p>
            </div>
          ) : (
            milestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden border-l-4 ${
                  milestone.status === 'completed' 
                    ? uiConfig.colors.borderSuccess
                    : milestone.status === 'in_progress'
                    ? uiConfig.colors.borderActive
                    : uiConfig.colors.border
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-1 md:mb-0`}>
                      {milestone.milestone}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(milestone.status)}
                      <span className={`text-sm ${uiConfig.colors.hint}`}>
                        {formatDate(milestone.target_date)}
                      </span>
                    </div>
                  </div>
                  
                  {milestone.notes && (
                    <p className={`${uiConfig.colors.body} text-sm mb-4`}>
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
                            className={`text-xs px-2 py-1 ${uiConfig.colors.btnSecondary} rounded`}
                          >
                            Mark Not Started
                          </button>
                        )}
                        
                        {milestone.status !== 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(milestone.id, 'in_progress')}
                            className={`text-xs px-2 py-1 ${uiConfig.colors.statusInfo} rounded ${uiConfig.animation.transition}`}
                          >
                            Mark In Progress
                          </button>
                        )}
                        
                        {milestone.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(milestone.id, 'completed')}
                            className={`text-xs px-2 py-1 ${uiConfig.colors.statusSuccess} rounded ${uiConfig.animation.transition}`}
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
                        className={`text-xs px-2 py-1 ${uiConfig.colors.btnSecondary} rounded`}
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className={`text-xs px-2 py-1 ${uiConfig.colors.statusError} rounded ${uiConfig.animation.transition}`}
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
        <div className={`${uiConfig.notifications.success} border ${uiConfig.layout.radius.lg} p-4`}>
          <h3 className={`text-lg font-semibold ${uiConfig.colors.success} mb-2`}>
            Tips for Planning Your Retirement Timeline
          </h3>
          
          <ul className={`space-y-2 ${uiConfig.colors.success} text-sm`}>
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