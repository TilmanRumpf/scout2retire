-- Create table for tracking dismissed data verification issues
-- This allows admins to dismiss valid but acceptable issues (like equatorial temps)
-- with comments explaining why, creating an audit trail

CREATE TABLE IF NOT EXISTS public.data_verification_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Which town and field has the dismissed issue
    town_id UUID NOT NULL REFERENCES public.towns(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,

    -- What type of issue was dismissed
    issue_type TEXT NOT NULL, -- 'out_of_range', 'impossible_value', 'breaks_convention', etc.
    issue_description TEXT NOT NULL,
    dismissed_value JSONB, -- Store the actual value that triggered the issue

    -- Who dismissed it and when
    dismissed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Why was it dismissed (required explanation)
    dismissal_comment TEXT NOT NULL,

    -- Allow un-dismissing if needed
    undismissed_at TIMESTAMPTZ,
    undismissed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    undismissal_comment TEXT,

    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure we don't have duplicate dismissals for same issue
    UNIQUE(town_id, field_name, issue_type)
);

-- Add indexes for performance
CREATE INDEX idx_dismissals_town ON public.data_verification_dismissals(town_id);
CREATE INDEX idx_dismissals_field ON public.data_verification_dismissals(field_name);
CREATE INDEX idx_dismissals_active ON public.data_verification_dismissals(town_id, field_name)
    WHERE undismissed_at IS NULL;

-- Enable RLS
ALTER TABLE public.data_verification_dismissals ENABLE ROW LEVEL SECURITY;

-- Policies: All authenticated users can read dismissals
CREATE POLICY "Anyone can view dismissals"
    ON public.data_verification_dismissals
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated users can dismiss issues
CREATE POLICY "Authenticated users can dismiss issues"
    ON public.data_verification_dismissals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = dismissed_by);

-- Only the person who dismissed can undismiss (or admins could be added here)
CREATE POLICY "Users can undismiss their own dismissals"
    ON public.data_verification_dismissals
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = dismissed_by);

-- Add comment
COMMENT ON TABLE public.data_verification_dismissals IS
    'Tracks dismissed data verification issues with admin comments. Allows human override of automated validation with audit trail.';

COMMENT ON COLUMN public.data_verification_dismissals.dismissal_comment IS
    'Required explanation of why this issue is acceptable (e.g., "Equatorial location - minimal seasonal variation expected")';
