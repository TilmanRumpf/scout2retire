import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

export default function MasterSchedule() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRetirementYear, setUserRetirementYear] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    milestone: '',
    target_date: '',
    status: null,
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
        
        // Fetch user's retirement year
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('retirement_year_estimate')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          console.error("Error fetching user retirement year:", userError);
        } else {
          setUserRetirementYear(userData?.retirement_year_estimate);
        }
        
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
        console.log('Loaded milestones:', data?.length, 'items');
        console.log('Milestone names:', data?.map(m => m.milestone));
        
        // If no milestones exist, create default ones
        if (!data || data.length === 0) {
          await createDefaultMilestones(user.id);
          // Force page reload to show all milestones
          window.location.reload();
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
      // Get user retirement date
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('retirement_year_estimate')
        .eq('id', userId)
        .single();
      
      if (userError) {
        throw new Error(userError.message);
      }
      
      // Set retirement date to end of retirement year (December 31st) instead of January 1st
      const retirementDate = new Date(userData?.retirement_year_estimate || new Date().getFullYear() + 5, 11, 31);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const retirementYear = retirementDate.getFullYear();
      const monthsToRetirement = (retirementYear - currentDate.getFullYear()) * 12 - currentMonth;
      
      // Helper to ensure dates are in the future with minimum delays
      const getFutureDate = (monthsFromNow, minimumDays = 30) => {
        const date = new Date();
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + monthsFromNow);
        
        // Ensure minimum days in future
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + minimumDays);
        
        // Return the later of the two dates
        const finalDate = targetDate > minDate ? targetDate : minDate;
        return finalDate.toISOString().split('T')[0];
      };
      
      // Default milestones - comprehensive 11-step retirement planning timeline
      const defaultMilestones = [
        {
          user_id: userId,
          milestone: 'Research Potential Locations',
          target_date: getFutureDate(1, 7), // At least 1 week to start research
          notes: 'Explore towns using Scout2Retire and create a shortlist of favorites.'
        },
        {
          user_id: userId,
          milestone: 'Declutter Your Current Home',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.2), 30), // 30 days minimum
          notes: 'Start downsizing possessions and donate/sell items you won\'t need in retirement. Begin with one room at a time.'
        },
        {
          user_id: userId,
          milestone: 'Visit Top 3 Locations',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.3), 75), // 75 DAYS MINIMUM for trip planning!
          notes: 'Plan trips to experience the lifestyle in each location.'
        },
        {
          user_id: userId,
          milestone: 'Healthcare Coverage Research',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.4), 60), // 60 days - healthcare research takes time
          notes: 'Research Medicare options, international health insurance, or local healthcare systems in your target location.'
        },
        {
          user_id: userId,
          milestone: 'Financial Planning',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.5)),
          notes: 'Meet with financial advisor to finalize retirement budget and savings plan.'
        },
        {
          user_id: userId,
          milestone: 'Language & Cultural Preparation',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.6)),
          notes: 'Start learning the local language, customs, and cultural norms of your chosen retirement destination.'
        },
        {
          user_id: userId,
          milestone: 'Housing Decision',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.7)),
          notes: 'Decide whether to rent or buy in chosen location.'
        },
        {
          user_id: userId,
          milestone: 'Social Network Building',
          target_date: getFutureDate(Math.floor(monthsToRetirement * 0.8)),
          notes: 'Connect with expat communities, local groups, and potential friends in your retirement location through online forums and social media.'
        },
        {
          user_id: userId,
          milestone: 'Visa/Immigration Paperwork',
          target_date: getFutureDate(monthsToRetirement - 12, 90), // 90 days - visa processing needs lead time
          notes: 'Start paperwork for residence permits or visas if moving internationally.'
        },
        {
          user_id: userId,
          milestone: 'Final Move Logistics',
          target_date: getFutureDate(monthsToRetirement - 6, 45), // 45 days - movers need advance booking
          notes: 'Arrange international movers, ship belongings, set up utilities, and handle final administrative tasks for your move.'
        },
        {
          user_id: userId,
          milestone: 'Moving Day!',
          target_date: retirementDate.toISOString().split('T')[0],
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
        status: formData.status || null,
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
        status: null,
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
          status: formData.status || null,
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
                status: formData.status || null,
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
      case null:
      case undefined:
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
            Pending
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
            Unknown
          </span>
        );
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parse the date properly to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
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
      <UnifiedHeader 
        title="Retirement Master Schedule"
      />
      <HeaderSpacer />

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-6 space-y-6">
        {/* Retirement Year Banner */}
        {userRetirementYear && (
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-6 text-center border-2 border-scout-accent-500`}>
            <h2 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-2`}>
              Your Retirement Target: {userRetirementYear}
            </h2>
            <p className={`${uiConfig.colors.body}`}>
              {(() => {
                const yearsToGo = userRetirementYear - new Date().getFullYear();
                if (yearsToGo < 0) return "You're already retired! 🎉";
                if (yearsToGo === 0) return "This is your retirement year! 🎊";
                if (yearsToGo === 1) return "Just 1 year to go! Almost there! 💪";
                return `${yearsToGo} years to go - let's make them count! 🚀`;
              })()}
            </p>
          </div>
        )}
        
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
                status: null,
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
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  className={uiConfig.components.select}
                >
                  <option value="">Pending</option>
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
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  className={uiConfig.components.select}
                >
                  <option value="">Pending</option>
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
            <>
              <div className="text-sm text-gray-600 mb-2">
                Showing {milestones.length} milestones
              </div>
              {milestones.map((milestone, index) => (
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
                        <button
                          onClick={() => handleStatusChange(milestone.id, 'not_started')}
                          className={`text-xs px-2 py-1 ${milestone.status === 'not_started' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : uiConfig.colors.btnSecondary} rounded`}
                          disabled={milestone.status === 'not_started'}
                        >
                          Not Started
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(milestone.id, 'in_progress')}
                          className={`text-xs px-2 py-1 ${milestone.status === 'in_progress' ? 'bg-blue-200 text-blue-800 cursor-not-allowed' : uiConfig.colors.statusInfo} rounded ${uiConfig.animation.transition}`}
                          disabled={milestone.status === 'in_progress'}
                        >
                          In Progress
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(milestone.id, 'completed')}
                          className={`text-xs px-2 py-1 ${milestone.status === 'completed' ? 'bg-green-200 text-green-800 cursor-not-allowed' : uiConfig.colors.statusSuccess} rounded ${uiConfig.animation.transition}`}
                          disabled={milestone.status === 'completed'}
                        >
                          Completed
                        </button>
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
            ))}
            </>
          )}
        </div>
        
        {/* Tips section */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card} border-l-4 border-blue-500`}>
          <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-3 flex items-center`}>
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              💡
            </span>
            Planning Tips
          </h3>
          
          <ul className={`space-y-3 ${uiConfig.colors.body} text-sm`}>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Start researching potential locations at least 5 years before your planned retirement date.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Visit your top choices during different seasons to experience the full climate cycle.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Begin visa and immigration paperwork at least 12-18 months before your planned move.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Consider a "trial retirement" by spending 2-3 months in your chosen location before making a permanent move.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span>Plan your healthcare transition well in advance, especially for international moves.</span>
            </li>
          </ul>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
    </div>
  );
}