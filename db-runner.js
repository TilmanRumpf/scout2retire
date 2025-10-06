#!/usr/bin/env node

/**
 * DATABASE TASK RUNNER
 *
 * Simple, hands-off runner for database operations via JSON task files.
 *
 * Usage:
 *   npm run db:run db-tasks/task-name.json           # Dry run (preview)
 *   npm run db:run db-tasks/task-name.json -- --apply  # Execute changes
 */

// CRITICAL: Delete any stale shell env vars before loading .env
// (Claude Code or terminal may have old cached keys)
delete process.env.SUPABASE_SERVICE_ROLE_KEY

import dotenv from 'dotenv'
dotenv.config()

import { supabaseAdmin, chunkArray } from './src/utils/supabaseAdmin.js'
import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const taskFile = args[0]
const applyMode = args.includes('--apply')

if (!taskFile) {
  console.error('❌ Error: No task file specified')
  console.error('Usage: npm run db:run <task-file.json> [-- --apply]')
  process.exit(1)
}

if (!fs.existsSync(taskFile)) {
  console.error(`❌ Error: Task file not found: ${taskFile}`)
  process.exit(1)
}

// Read and parse task
const task = JSON.parse(fs.readFileSync(taskFile, 'utf8'))

// Validate task structure
if (!task.table || !task.operation) {
  console.error('❌ Error: Invalid task file. Required: table, operation')
  process.exit(1)
}

console.log(`\n📋 Task: ${task.description || 'Database operation'}`)
console.log(`📊 Table: ${task.table}`)
console.log(`🔧 Operation: ${task.operation}`)
console.log(`🎯 Mode: ${applyMode ? 'APPLY (live execution)' : 'DRY RUN (preview only)'}\n`)

async function executeTask() {
  const startTime = Date.now()

  try {
    switch (task.operation) {
      case 'update':
        await handleUpdate()
        break
      case 'upsert':
        await handleUpsert()
        break
      case 'insert':
        await handleInsert()
        break
      default:
        throw new Error(`Unsupported operation: ${task.operation}`)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n✅ Task completed in ${duration}s`)

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('\n📋 Rollback: Restore from snapshot if needed')
    process.exit(1)
  }
}

async function handleUpdate() {
  const { table, updates, filters = {} } = task

  // Step 1: Preview affected rows
  console.log('Step 1: Querying affected rows...')
  // Select all columns to handle different table schemas
  let query = supabaseAdmin.from(table).select('*')

  // Apply filters (null-safe)
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === 'null') {
      query = query.is(key, null)
    } else if (Array.isArray(value)) {
      query = query.in(key, value)
    } else {
      query = query.eq(key, value)
    }
  })

  const { data: preview, error: previewError } = await query

  if (previewError) throw previewError

  console.log(`   Found ${preview?.length || 0} rows to update`)
  if (preview?.length > 0) {
    const displayName = (r) => r.name || r.title || r.id
    console.log('   Sample:', preview.slice(0, 3).map(r => `${displayName(r)} (${r.id})`).join(', '))
  }

  if (!preview || preview.length === 0) {
    console.log('\n✅ No records need updating. Exiting.')
    return
  }

  if (!applyMode) {
    console.log('\n🔍 DRY RUN COMPLETE')
    console.log(`   Would update ${preview.length} rows with:`)
    console.log('   ', JSON.stringify(updates, null, 2))
    console.log('\n   To execute: add -- --apply flag')
    return
  }

  // Step 2: Execute update
  console.log('\nStep 2: Executing update...')
  let updateQuery = supabaseAdmin.from(table).update(updates)

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === 'null') {
      updateQuery = updateQuery.is(key, null)
    } else if (Array.isArray(value)) {
      updateQuery = updateQuery.in(key, value)
    } else {
      updateQuery = updateQuery.eq(key, value)
    }
  })

  const { data: result, error } = await updateQuery.select('id')

  if (error) throw error

  console.log(`   ✅ Updated ${result?.length || 0} rows`)

  // Step 3: Verify
  console.log('\nStep 3: Verification...')
  const { data: remaining } = await supabaseAdmin
    .from(table)
    .select('id')
    .is(Object.keys(filters)[0], null)

  console.log(`   Remaining nulls: ${remaining?.length || 0}`)

  // Log operation
  logOperation({
    task: path.basename(taskFile),
    operation: 'update',
    table,
    filters,
    updates,
    affected: result?.length || 0,
    timestamp: new Date().toISOString()
  })
}

async function handleUpsert() {
  const { table, records, onConflict, chunkSize = 500 } = task

  if (!Array.isArray(records)) {
    throw new Error('Upsert operation requires "records" array')
  }

  console.log(`Step 1: Preparing ${records.length} records...`)
  console.log(`   Chunk size: ${chunkSize}`)

  if (!applyMode) {
    console.log('\n🔍 DRY RUN COMPLETE')
    console.log(`   Would upsert ${records.length} records`)
    console.log('   Sample:', records.slice(0, 2))
    console.log('\n   To execute: add -- --apply flag')
    return
  }

  // Execute in chunks
  console.log('\nStep 2: Executing upsert...')
  const chunks = chunkArray(records, chunkSize)
  const results = []

  for (let i = 0; i < chunks.length; i++) {
    console.log(`   Chunk ${i + 1}/${chunks.length}...`)

    let query = supabaseAdmin.from(table).upsert(chunks[i])
    if (onConflict) query = query.onConflict(onConflict)

    const { data, error } = await query.select('id')

    if (error) throw error
    results.push(...(data || []))
  }

  console.log(`   ✅ Upserted ${results.length} records`)

  // Log operation
  logOperation({
    task: path.basename(taskFile),
    operation: 'upsert',
    table,
    affected: results.length,
    timestamp: new Date().toISOString()
  })
}

async function handleInsert() {
  const { table, records, chunkSize = 500 } = task

  if (!Array.isArray(records)) {
    throw new Error('Insert operation requires "records" array')
  }

  console.log(`Step 1: Preparing ${records.length} records...`)

  if (!applyMode) {
    console.log('\n🔍 DRY RUN COMPLETE')
    console.log(`   Would insert ${records.length} records`)
    console.log('   Sample:', records.slice(0, 2))
    console.log('\n   To execute: add -- --apply flag')
    return
  }

  // Execute in chunks
  console.log('\nStep 2: Executing insert...')
  const chunks = chunkArray(records, chunkSize)
  const results = []

  for (let i = 0; i < chunks.length; i++) {
    console.log(`   Chunk ${i + 1}/${chunks.length}...`)

    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(chunks[i])
      .select('id')

    if (error) throw error
    results.push(...(data || []))
  }

  console.log(`   ✅ Inserted ${results.length} records`)

  // Log operation
  logOperation({
    task: path.basename(taskFile),
    operation: 'insert',
    table,
    affected: results.length,
    timestamp: new Date().toISOString()
  })
}

function logOperation(details) {
  const logFile = 'database-utilities/operation-log.jsonl'
  const logEntry = JSON.stringify(details) + '\n'

  if (!fs.existsSync('database-utilities')) {
    fs.mkdirSync('database-utilities', { recursive: true })
  }

  fs.appendFileSync(logFile, logEntry)
  console.log(`\n📝 Logged to: ${logFile}`)
}

// Execute
executeTask()
