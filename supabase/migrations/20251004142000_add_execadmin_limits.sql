-- =====================================================
-- MIGRATION: Add Executive Admin Feature Limits
-- Date: October 4, 2025 14:20
-- Description: execadmin category was created but has NO limits
--              This creates unlimited limits for all features
-- =====================================================

DO $$
DECLARE
  v_execadmin_id UUID;
  v_chat_partners_id UUID;
  v_town_favorites_id UUID;
  v_regions_id UUID;
  v_town_displays_id UUID;
  v_scotty_chats_id UUID;
  v_top_matches_id UUID;
  v_compare_towns_id UUID;
  v_fresh_discoveries_id UUID;
  v_pdf_exports_id UUID;
  v_white_label_id UUID;
  v_api_access_id UUID;
  v_team_seats_id UUID;
BEGIN
  -- Get execadmin category ID
  SELECT id INTO v_execadmin_id FROM user_categories WHERE category_code = 'execadmin';

  IF v_execadmin_id IS NULL THEN
    RAISE EXCEPTION 'execadmin category not found!';
  END IF;

  -- Get all feature IDs
  SELECT id INTO v_chat_partners_id FROM feature_definitions WHERE feature_code = 'chat_partners';
  SELECT id INTO v_town_favorites_id FROM feature_definitions WHERE feature_code = 'town_favorites';
  SELECT id INTO v_regions_id FROM feature_definitions WHERE feature_code = 'regions';
  SELECT id INTO v_town_displays_id FROM feature_definitions WHERE feature_code = 'town_displays';
  SELECT id INTO v_scotty_chats_id FROM feature_definitions WHERE feature_code = 'scotty_chats';
  SELECT id INTO v_top_matches_id FROM feature_definitions WHERE feature_code = 'top_matches';
  SELECT id INTO v_compare_towns_id FROM feature_definitions WHERE feature_code = 'compare_towns';
  SELECT id INTO v_fresh_discoveries_id FROM feature_definitions WHERE feature_code = 'fresh_discoveries';
  SELECT id INTO v_pdf_exports_id FROM feature_definitions WHERE feature_code = 'pdf_exports';
  SELECT id INTO v_white_label_id FROM feature_definitions WHERE feature_code = 'white_label_reports';
  SELECT id INTO v_api_access_id FROM feature_definitions WHERE feature_code = 'api_access';
  SELECT id INTO v_team_seats_id FROM feature_definitions WHERE feature_code = 'team_seats';

  -- EXECUTIVE ADMIN = UNLIMITED EVERYTHING
  INSERT INTO category_limits (category_id, feature_id, limit_value) VALUES
    (v_execadmin_id, v_chat_partners_id, NULL),       -- Unlimited
    (v_execadmin_id, v_town_favorites_id, NULL),      -- Unlimited
    (v_execadmin_id, v_regions_id, NULL),             -- Unlimited
    (v_execadmin_id, v_town_displays_id, NULL),       -- Unlimited
    (v_execadmin_id, v_scotty_chats_id, NULL),        -- Unlimited
    (v_execadmin_id, v_top_matches_id, NULL),         -- Unlimited (admins can see everything)
    (v_execadmin_id, v_compare_towns_id, NULL),       -- Unlimited
    (v_execadmin_id, v_fresh_discoveries_id, NULL),   -- Unlimited
    (v_execadmin_id, v_pdf_exports_id, NULL),         -- Unlimited
    (v_execadmin_id, v_white_label_id, 1),            -- Enabled
    (v_execadmin_id, v_api_access_id, 1),             -- Enabled
    (v_execadmin_id, v_team_seats_id, NULL)           -- Unlimited
  ON CONFLICT (category_id, feature_id) DO UPDATE
    SET limit_value = EXCLUDED.limit_value;

  RAISE NOTICE 'Created feature limits for execadmin category';
END $$;
