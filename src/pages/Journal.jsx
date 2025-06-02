// pages/Journal.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { fetchJournalEntries, deleteJournalEntry, saveJournalEntry } from '../utils/journalUtils';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';

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
  }, [filterType, dateRange]);

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

    setSavingNote(true);
    try {
      const { success } = await saveJournalEntry(userId, newNoteContent);
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
    if (entryType === 'journal') return '📝';
    if (entryType.startsWith('town_')) return '📍';
    if (entryType === 'connection_made') return '👥';
    if (entryType.startsWith('task_')) return '✅';
    return '📄';
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
          <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
          <button 
            onClick={() => handleDelete(entry.id)}
            className="text-red-600 hover:text-red-700 text-sm"
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
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            View
          </button>
          <button 
            onClick={() => handleDelete(entry.id)}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      );
    }
    
    if (entry.related_user) {
      return (
        <div className="flex justify-end">
          <button className="text-blue-600 hover:text-blue-700 text-sm">
            Profile
          </button>
        </div>
      );
    }
    
    return null;
  };

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading entries...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      <header className="bg-white dark:bg-gray-800 shadow-sm mb-6">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Retirement Journey</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Type filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('journal')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'journal'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                📝 Journal
              </button>
              <button
                onClick={() => setFilterType('town')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'town'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                📍 Town
              </button>
              <button
                onClick={() => setFilterType('social')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'social'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                👥 Social
              </button>
              <button
                onClick={() => setFilterType('tasks')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'tasks'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                ✅ Tasks
              </button>
            </div>

            {/* Date filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* New Note Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          {!showNewNote ? (
            <button
              onClick={() => setShowNewNote(true)}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>📝</span>
              <span>Add New Note</span>
            </button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your thoughts about your retirement journey..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 min-h-[120px]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowNewNote(false);
                    setNewNoteContent('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote || !newNoteContent.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No entries found for the selected filters.
              </p>
              <button
                onClick={() => navigate('/daily')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-pre-line text-sm text-gray-900 dark:text-gray-300">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-4 text-2xl">
                        {getEntryIcon(entry.entry_type)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                        <div>
                          <p className="font-medium line-clamp-2">{entry.content}</p>
                          {entry.towns && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {entries.length} entries
              </p>
            </div>
          )}
        </div>
      </main>

      <QuickNav />
    </div>
  );
}