-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Allow system/triggers to create notifications (uses SECURITY DEFINER)
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Create function to auto-create notifications for new invitations
CREATE OR REPLACE FUNCTION create_invitation_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
    sender_email TEXT;
BEGIN
    -- Only create notification for new pending invitations
    IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
        -- Get sender's name and email
        SELECT COALESCE(full_name, email), email 
        INTO sender_name, sender_email
        FROM users
        WHERE id = NEW.user_id;
        
        -- Create notification for recipient
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            NEW.friend_id,
            'friend_invitation',
            'New Friend Request',
            COALESCE(sender_name, 'Someone') || ' sent you a friend request',
            jsonb_build_object(
                'connection_id', NEW.id,
                'sender_id', NEW.user_id,
                'sender_name', sender_name,
                'sender_email', sender_email,
                'invitation_message', NEW.message
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new invitations
DROP TRIGGER IF EXISTS create_invitation_notification_trigger ON user_connections;
CREATE TRIGGER create_invitation_notification_trigger
AFTER INSERT ON user_connections
FOR EACH ROW
EXECUTE FUNCTION create_invitation_notification();

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE id = notification_id 
    AND user_id = auth.uid()
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INT AS $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE user_id = auth.uid()
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = auth.uid()
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Also ensure user_connections RLS allows recipients to see invitations
DO $$
BEGIN
    -- Check if the policy exists before dropping
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_connections' 
        AND policyname = 'Users can view their own connections'
    ) THEN
        DROP POLICY "Users can view their own connections" ON user_connections;
    END IF;
END $$;

-- Create comprehensive view policy
CREATE POLICY "Users can view connections where they are involved"
ON user_connections FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);