-- Notification trigger functions for Scout2Retire
-- These functions create notifications when certain events occur

-- Function to create notification when a new town matches user preferences
CREATE OR REPLACE FUNCTION notify_new_match(
    p_user_id UUID,
    p_town_id INTEGER,
    p_match_score INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_town_name TEXT;
    v_country TEXT;
BEGIN
    -- Get town details
    SELECT name, country INTO v_town_name, v_country
    FROM towns
    WHERE id = p_town_id;

    -- Create notification
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        town_id,
        data
    ) VALUES (
        p_user_id,
        'new_match',
        'New town matches your preferences!',
        v_town_name || ', ' || v_country || ' matches ' || p_match_score || '% of your retirement preferences',
        p_town_id,
        jsonb_build_object(
            'match_score', p_match_score,
            'town_name', v_town_name,
            'country', v_country
        )
    ) RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify when a favorited town has updates
CREATE OR REPLACE FUNCTION notify_favorite_update(
    p_user_id UUID,
    p_town_id INTEGER,
    p_update_type TEXT,
    p_update_details TEXT
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_town_name TEXT;
BEGIN
    -- Get town name
    SELECT name INTO v_town_name
    FROM towns
    WHERE id = p_town_id;

    -- Create notification
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        town_id,
        data
    ) VALUES (
        p_user_id,
        'favorite_update',
        'Update for ' || v_town_name,
        p_update_details,
        p_town_id,
        jsonb_build_object(
            'update_type', p_update_type,
            'town_name', v_town_name
        )
    ) RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify about significant price changes
CREATE OR REPLACE FUNCTION notify_price_change(
    p_user_id UUID,
    p_town_id INTEGER,
    p_old_cost INTEGER,
    p_new_cost INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_town_name TEXT;
    v_change_percent INTEGER;
    v_direction TEXT;
BEGIN
    -- Calculate change
    v_change_percent := ROUND(((p_new_cost - p_old_cost)::DECIMAL / p_old_cost) * 100);
    v_direction := CASE WHEN v_change_percent > 0 THEN 'increased' ELSE 'decreased' END;

    -- Get town name
    SELECT name INTO v_town_name
    FROM towns
    WHERE id = p_town_id;

    -- Create notification
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        town_id,
        data
    ) VALUES (
        p_user_id,
        'price_change',
        'Price update for ' || v_town_name,
        'Cost of living ' || v_direction || ' by ' || ABS(v_change_percent) || '% in your favorited town',
        p_town_id,
        jsonb_build_object(
            'old_cost', p_old_cost,
            'new_cost', p_new_cost,
            'change_percent', v_change_percent,
            'town_name', v_town_name
        )
    ) RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notifications when a user favorites a town
CREATE OR REPLACE FUNCTION on_favorite_created()
RETURNS TRIGGER AS $$
DECLARE
    v_match_score INTEGER;
BEGIN
    -- Calculate match score for the favorited town
    -- (This is a simplified version - you'd use your actual matching algorithm)
    v_match_score := 75 + FLOOR(RANDOM() * 20); -- Mock score 75-95%

    -- Create a notification about the new favorite
    PERFORM notify_new_match(NEW.user_id, NEW.town_id, v_match_score);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on saved_locations table
DROP TRIGGER IF EXISTS create_favorite_notification ON saved_locations;
CREATE TRIGGER create_favorite_notification
    AFTER INSERT ON saved_locations
    FOR EACH ROW
    EXECUTE FUNCTION on_favorite_created();

-- Function to send weekly digest notifications
CREATE OR REPLACE FUNCTION send_weekly_digests()
RETURNS INTEGER AS $$
DECLARE
    v_user RECORD;
    v_notification_count INTEGER := 0;
BEGIN
    -- Loop through active users
    FOR v_user IN 
        SELECT id, email, full_name
        FROM users
        WHERE onboarding_completed = true
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
    LOOP
        -- Create weekly digest notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            expires_at
        ) VALUES (
            v_user.id,
            'weekly_digest',
            'Your weekly Scout2Retire update',
            'Check out new towns matching your preferences and updates to your favorites',
            jsonb_build_object(
                'week_of', DATE_TRUNC('week', CURRENT_DATE)
            ),
            CURRENT_TIMESTAMP + INTERVAL '7 days'
        );
        
        v_notification_count := v_notification_count + 1;
    END LOOP;

    RETURN v_notification_count;
END;
$$ LANGUAGE plpgsql;

-- Example: Create a test notification for a user
-- SELECT notify_new_match('user-uuid-here', 1, 85);