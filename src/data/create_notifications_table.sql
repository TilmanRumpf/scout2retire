-- Create notifications table for Scout2Retire
-- Supports various notification types relevant to retirement planning

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'new_match',           -- New town matches preferences
        'favorite_update',     -- Updates to favorited towns
        'price_change',        -- Significant cost changes
        'new_feature',         -- New app features
        'weekly_digest',       -- Weekly summary
        'friend_activity',     -- Friend favorited or reviewed town
        'system'              -- System messages
    )),
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities (optional)
    town_id INTEGER REFERENCES towns(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Metadata
    data JSONB DEFAULT '{}',  -- Additional data like match_score, price_change_amount, etc.
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,  -- Optional expiration
    
    -- Indexes for performance
    CONSTRAINT notifications_user_created_idx UNIQUE (user_id, created_at, id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON notifications(user_id, is_read, created_at DESC) 
    WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_type 
    ON notifications(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_town 
    ON notifications(town_id) 
    WHERE town_id IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET 
        is_read = TRUE,
        read_at = CURRENT_TIMESTAMP
    WHERE 
        id = notification_id 
        AND user_id = auth.uid()
        AND is_read = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET 
        is_read = TRUE,
        read_at = CURRENT_TIMESTAMP
    WHERE 
        user_id = auth.uid()
        AND is_read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM notifications 
        WHERE 
            user_id = auth.uid() 
            AND is_read = FALSE
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE 
        (created_at < CURRENT_TIMESTAMP - INTERVAL '30 days' AND is_read = TRUE)
        OR (expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Sample notification creation (for testing)
-- This shows how to create different types of notifications
COMMENT ON TABLE notifications IS '
Example notification inserts:

-- New match notification
INSERT INTO notifications (user_id, type, title, message, town_id, data)
VALUES (
    ''user-uuid'',
    ''new_match'',
    ''New town matches your preferences!'',
    ''Porto, Portugal matches 85% of your retirement preferences'',
    123,
    ''{"match_score": 85, "top_features": ["coastal", "affordable", "great_healthcare"]}''::jsonb
);

-- Price change notification
INSERT INTO notifications (user_id, type, title, message, town_id, data)
VALUES (
    ''user-uuid'',
    ''price_change'',
    ''Price update for Bordeaux'',
    ''Cost of living decreased by 8% in your favorited town'',
    456,
    ''{"old_cost": 2500, "new_cost": 2300, "change_percent": -8}''::jsonb
);
';