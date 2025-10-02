-- FIX: Prevent duplicate town chat threads
-- Problem: Multiple users create separate threads for same town
-- Solution: Unique constraint + consolidate duplicates

-- Step 1: Consolidate existing duplicate threads
-- For each town with multiple threads, keep the one with messages (or oldest)

DO $$
DECLARE
  town_rec RECORD;
  thread_to_keep UUID;
  thread_to_delete UUID;
BEGIN
  -- Find all towns with duplicate threads
  FOR town_rec IN
    SELECT town_id, COUNT(*) as thread_count
    FROM chat_threads
    WHERE town_id IS NOT NULL
    GROUP BY town_id
    HAVING COUNT(*) > 1
  LOOP
    RAISE NOTICE 'Town % has % duplicate threads', town_rec.town_id, town_rec.thread_count;

    -- Find the thread to keep (prioritize: has messages > oldest)
    SELECT t.id INTO thread_to_keep
    FROM chat_threads t
    LEFT JOIN (
      SELECT thread_id, COUNT(*) as msg_count
      FROM chat_messages
      GROUP BY thread_id
    ) m ON t.id = m.thread_id
    WHERE t.town_id = town_rec.town_id
    ORDER BY
      COALESCE(m.msg_count, 0) DESC,  -- Threads with messages first
      t.created_at ASC                 -- Then oldest thread
    LIMIT 1;

    RAISE NOTICE 'Keeping thread: %', thread_to_keep;

    -- Move messages from duplicate threads to the main thread
    UPDATE chat_messages
    SET thread_id = thread_to_keep
    WHERE thread_id IN (
      SELECT id
      FROM chat_threads
      WHERE town_id = town_rec.town_id
      AND id != thread_to_keep
    );

    -- Delete duplicate threads
    DELETE FROM chat_threads
    WHERE town_id = town_rec.town_id
    AND id != thread_to_keep;

    RAISE NOTICE 'Consolidated threads for town %', town_rec.town_id;
  END LOOP;
END $$;

-- Step 2: Add unique constraint to prevent future duplicates
-- One thread per town (for town chats)
CREATE UNIQUE INDEX IF NOT EXISTS unique_town_thread
ON chat_threads(town_id)
WHERE town_id IS NOT NULL;

-- Step 3: Add comment for documentation
COMMENT ON INDEX unique_town_thread IS
'Ensures only one chat thread exists per town. Prevents duplicate threads when multiple users visit same town.';

-- Verification query
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT town_id
    FROM chat_threads
    WHERE town_id IS NOT NULL
    GROUP BY town_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Still have % towns with duplicate threads!', duplicate_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All duplicate town threads consolidated';
  END IF;
END $$;
