// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Get environment variables (Vite requires VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('Supabase URL from env:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
}

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables')
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables')
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client with options (singleton pattern to avoid multiple instances)
let supabaseClient;

if (!supabaseClient) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        // Use localStorage explicitly for better mobile support
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
          }
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        }
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

export const supabase = supabaseClient

// Connection test function
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test auth service first (most reliable test)
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('❌ Supabase auth service failed:', authError.message)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('Current session:', session ? `User logged in: ${session.user.email}` : 'No active session')
    
    // Test database connectivity by trying to access auth.users (always available)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.warn('⚠️ User fetch issue:', userError.message)
      } else {
        console.log('✅ Database connectivity confirmed!')
        if (user) {
          console.log('✅ User data accessible:', user.email)
        }
      }
    } catch (userError) {
      console.warn('⚠️ User test failed:', userError.message)
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Test database table access
async function testTableAccess(tableName = 'users') {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log(`ℹ️ Table "${tableName}" doesn't exist yet`)
        return false
      } else {
        console.log(`🔒 Table "${tableName}" access restricted:`, error.message)
        console.log('   (This is normal if Row Level Security is enabled)')
        return false
      }
    } else {
      console.log(`✅ Successfully accessed table "${tableName}"!`)
      if (data && data.length > 0) {
        console.log('   Sample data found:', data.length, 'records')
      } else {
        console.log('   Table is empty but accessible')
      }
      return true
    }
  } catch (error) {
    console.log(`❌ Error testing table "${tableName}":`, error.message)
    return false
  }
}

// Discover available tables
async function discoverTables() {
  console.log('🔍 Checking for common tables...')
  const foundTables = []
  
  // Common table names to check - updated for scout2retire
  const commonTables = [
    'users',
    'towns', 
    'favorites',
    'saved_locations',
    'journal_entries',
    'user_connections',
    'regional_inspirations',
    'onboarding_progress'
  ]
  
  for (const tableName of commonTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`✅ Found table: ${tableName}`)
        foundTables.push(tableName)
      } else if (error.code === '42P01') {
        // Table doesn't exist - this is normal
        console.log(`ℹ️ Table "${tableName}" not found`)
      } else {
        // Other error (probably RLS or permissions)
        console.log(`🔒 Table "${tableName}" exists but access restricted:`, error.message)
        foundTables.push(`${tableName} (restricted)`)
      }
    } catch (error) {
      console.log(`❌ Error checking table "${tableName}":`, error.message)
    }
  }
  
  if (foundTables.length === 0) {
    console.log('ℹ️ No accessible tables found. This might be normal if:')
    console.log('   - You haven\'t created any tables yet')
    console.log('   - Row Level Security (RLS) is enabled')
    console.log('   - Check your Supabase dashboard for table names')
  } else {
    console.log(`✅ Found ${foundTables.length} accessible tables:`, foundTables)
  }
  
  return foundTables
}

// Run connection tests on initialization (only in development)
if (import.meta.env.DEV) {
  // Run tests after a short delay to ensure everything is initialized
  setTimeout(async () => {
    console.log('🚀 Running Supabase diagnostics...')
    
    const connected = await testSupabaseConnection()
    
    if (connected) {
      // Test table access with scout2retire table names
      const commonTables = ['users', 'towns', 'favorites', 'journal_entries']
      let foundAnyTable = false
      
      for (const tableName of commonTables) {
        const hasAccess = await testTableAccess(tableName)
        if (hasAccess) {
          foundAnyTable = true
          break // Found at least one accessible table
        }
      }
      
      if (!foundAnyTable) {
        // Discover what tables are available
        await discoverTables()
      }
      
      console.log('🎉 Supabase diagnostics completed!')
    } else {
      console.log('❌ Supabase diagnostics failed - check your configuration')
    }
  }, 1500)
}

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('Auth state changed:', event)
    if (session) {
      console.log('User authenticated:', session.user.email)
    } else {
      console.log('User signed out')
    }
  }
})

// Utility functions for common operations

// ============================================================================
// DEPRECATION NOTICE: Auth functions moved to authUtils.js
// ============================================================================
// The following functions are deprecated in this file.
// Please import from '../utils/authUtils' instead:
//
// import { signUp, signIn, signOut, getCurrentUser } from '../utils/authUtils';
//
// These re-exports are provided for backwards compatibility only
// and will be removed in a future version.
// ============================================================================

import {
  signUp as authUtilsSignUp,
  signIn as authUtilsSignIn,
  signOut as authUtilsSignOut,
  getCurrentUser as authUtilsGetCurrentUser
} from './authUtils';

/**
 * @deprecated Import from authUtils.js instead
 */
export const signUp = authUtilsSignUp;

/**
 * @deprecated Import from authUtils.js instead
 */
export const signIn = authUtilsSignIn;

/**
 * @deprecated Import from authUtils.js instead
 */
export const signOut = authUtilsSignOut;

/**
 * @deprecated Import from authUtils.js instead
 */
export const getCurrentUser = authUtilsGetCurrentUser;

// ============================================================================
// END DEPRECATED SECTION
// ============================================================================

// Database query helper
export const queryTable = async (tableName, options = {}) => {
  try {
    let query = supabase.from(tableName).select(options.select || '*')
    
    if (options.filter) {
      query = query.filter(options.filter.column, options.filter.operator, options.filter.value)
    }
    
    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending !== false })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error(`Query table "${tableName}" error:`, error.message)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error) {
    console.error(`Query table "${tableName}" failed:`, error)
    return { success: false, error: error.message }
  }
}

// Insert data helper
export const insertData = async (tableName, data) => {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
    
    if (error) {
      console.error(`Insert into "${tableName}" error:`, error.message)
      return { success: false, error: error.message }
    }
    
    console.log(`Insert into "${tableName}" successful:`, result)
    return { success: true, data: result }
  } catch (error) {
    console.error(`Insert into "${tableName}" failed:`, error)
    return { success: false, error: error.message }
  }
}

// Update data helper
export const updateData = async (tableName, updates, filter) => {
  try {
    let query = supabase.from(tableName).update(updates)
    
    if (filter) {
      query = query.filter(filter.column, filter.operator, filter.value)
    }
    
    const { data, error } = await query.select()
    
    if (error) {
      console.error(`Update "${tableName}" error:`, error.message)
      return { success: false, error: error.message }
    }
    
    console.log(`Update "${tableName}" successful:`, data)
    return { success: true, data }
  } catch (error) {
    console.error(`Update "${tableName}" failed:`, error)
    return { success: false, error: error.message }
  }
}

// Delete data helper
export const deleteData = async (tableName, filter) => {
  try {
    let query = supabase.from(tableName).delete()
    
    if (filter) {
      query = query.filter(filter.column, filter.operator, filter.value)
    }
    
    const { data, error } = await query.select()
    
    if (error) {
      console.error(`Delete from "${tableName}" error:`, error.message)
      return { success: false, error: error.message }
    }
    
    console.log(`Delete from "${tableName}" successful:`, data)
    return { success: true, data }
  } catch (error) {
    console.error(`Delete from "${tableName}" failed:`, error)
    return { success: false, error: error.message }
  }
}

// Export the client as default
export default supabase