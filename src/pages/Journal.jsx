// pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchJournalEntries, deleteJournalEntry, saveJournalEntry } from '../utils/journalUtils';
import { sanitizeJournalEntry, MAX_LENGTHS } from '../utils/sanitizeUtils';
import UnifiedHeader from '../components/UnifiedHeader';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import { FileText, MapPin, Users, CheckCircle, File } from 'lucide-react';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState(30);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, [filterType, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps
  // loadEntries uses filterType and dateRange internally, but doesn't need to be in dependencies

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      setUserId(user.id);
      
      const { success, entries: journalEntries } = await fetchJournalEntries(
        user.id, 
        { entryType: filterType, dateRange }
      );
      
      if (success) {
        setEntries(journalEntries);
      }
    } catch (err) {
      console.error("Error loading journal entries:", err);
      toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const { success } = await deleteJournalEntry(entryId, userId);
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        toast.success('Entry deleted');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('An error occurred');
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    // Sanitize and validate the journal entry
    const validation = sanitizeJournalEntry(newNoteContent);
    
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSavingNote(true);
    try {
      const { success } = await saveJournalEntry(userId, validation.sanitized);
      if (success) {
        toast.success('Note saved successfully');
        setNewNoteContent('');
        setShowNewNote(false);
        // Reload entries to show the new note
        await loadEntries();
      } else {
        toast.error('Failed to save note');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error('An error occurred');
    } finally {
      setSavingNote(false);
    }
  };

  const getEntryIcon = (entryType) => {
    const iconProps = { size: 16, className: "text-scout-accent-500" };
    
    if (entryType === 'journal') return <FileText {...iconProps} />;
    if (entryType.startsWith('town_')) return <MapPin {...iconProps} />;
    if (entryType === 'connection_made') return <Users {...iconProps} />;
    if (entryType.startsWith('task_')) return <CheckCircle {...iconProps} />;
    return <File {...iconProps} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today\n${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday\n${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getActionButton = (entry) => {
    if (entry.entry_type === 'journal') {
      return (
        <div className="flex justify-end space-x-2">
          <button className={`${uiConfig.colors.accent} hover:opacity-80 text-sm transition-opacity`}>View</button>
          <button 
            onClick={() => handleDelete(entry.id)}
            className={`${uiConfig.colors.error} hover:opacity-80 text-sm transition-opacity`}
          >
            Delete
          </button>
        </div>
      );
    }
    
    if (entry.towns) {
      return (
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => navigate(`/discover?town=${entry.towns.id}`)}
            className={`${uiConfig.colors.accent} hover:opacity-80 text-sm transition-opacity`}
          >
            View
          </button>
          <button 
            onClick={() => handleDelete(entry.id)}
            className={`${uiConfig.colors.error} hover:opacity-80 text-sm transition-opacity`}
          >
            Delete
          </button>
        </div>
      );
    }
    
    if (entry.related_user) {
      return (
        <div className="flex justify-end">
          <button className={`${uiConfig.colors.accent} hover:opacity-80 text-sm transition-opacity`}>
            Profile
          </button>
        </div>
      );
    }
    
    return null;
  };

  if (loading && entries.length === 0) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} font-semibold`}>Loading entries...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      <UnifiedHeader 
        title="Your Retirement Journey"
        tabs={[
          { id: 'all', label: 'All', isActive: filterType === 'all', onClick: () => setFilterType('all') },
          { id: 'journal', label: 'Journal', icon: FileText, isActive: filterType === 'journal', onClick: () => setFilterType('journal') },
          { id: 'town', label: 'Town', icon: MapPin, isActive: filterType === 'town', onClick: () => setFilterType('town') },
          { id: 'social', label: 'Social', icon: Users, isActive: filterType === 'social', onClick: () => setFilterType('social') },
          { id: 'tasks', label: 'Tasks', icon: CheckCircle, isActive: filterType === 'tasks', onClick: () => setFilterType('tasks') }
        ]}
      />

      <main className="pt-16 max-w-7xl mx-auto px-4 py-6">
        {/* Date filter */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4 mb-6`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${uiConfig.colors.body}`}>Filter by date:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className={`px-4 py-2 ${uiConfig.layout.radius.md} border ${uiConfig.colors.border} ${uiConfig.colors.input} ${uiConfig.colors.heading}`}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* New Note Section */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4 mb-6`}>
          {!showNewNote ? (
            <button
              onClick={() => setShowNewNote(true)}
              className={`w-full px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} flex items-center justify-center space-x-2`}
            >
              <FileText size={16} />
              <span>Add New Note</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  maxLength={MAX_LENGTHS.JOURNAL_ENTRY}
                  placeholder="Write your thoughts about your retirement journey..."
                  className={`${uiConfig.components.textarea} min-h-[120px]`}
                />
                {newNoteContent.length > 0 && (
                  <div className={`mt-1 text-xs ${uiConfig.colors.hint} text-right`}>
                    {newNoteContent.length} / {MAX_LENGTHS.JOURNAL_ENTRY}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowNewNote(false);
                    setNewNoteContent('');
                  }}
                  className={`px-4 py-2 ${uiConfig.components.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote || !newNoteContent.trim()}
                  className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md} ${uiConfig.states.disabled}`}
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${uiConfig.colors.body} mb-4`}>
                No entries found for the selected filters.
              </p>
              <button
                onClick={() => navigate('/daily')}
                className={`px-4 py-2 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.md}`}
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${uiConfig.components.tableHeader} border-b ${uiConfig.colors.borderLight}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left ${uiConfig.components.tableHeaderCell}`}>
                      Date
                    </th>
                    <th className={`px-4 py-3 text-left ${uiConfig.components.tableHeaderCell}`}>
                      Type
                    </th>
                    <th className={`px-4 py-3 text-left ${uiConfig.components.tableHeaderCell}`}>
                      Activity
                    </th>
                    <th className={`px-4 py-3 text-right ${uiConfig.components.tableHeaderCell}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${uiConfig.colors.borderLight}`}>
                  {entries.map((entry) => (
                    <tr key={entry.id} className={`${uiConfig.components.tableRow}`}>
                      <td className={`px-4 py-4 whitespace-pre-line text-sm ${uiConfig.colors.body}`}>
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          {getEntryIcon(entry.entry_type)}
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${uiConfig.colors.body}`}>
                        <div>
                          <p className="font-medium line-clamp-2">{entry.content}</p>
                          {entry.towns && (
                            <p className={`text-xs ${uiConfig.colors.hint} mt-1`}>
                              {entry.towns.name}, {entry.towns.country}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {getActionButton(entry)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {entries.length > 0 && (
            <div className={`px-4 py-3 ${uiConfig.components.tableHeader} border-t ${uiConfig.colors.borderLight}`}>
              <p className={`text-sm ${uiConfig.colors.body}`}>
                Showing {entries.length} entries
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}