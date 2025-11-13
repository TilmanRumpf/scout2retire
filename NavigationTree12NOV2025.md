# SCOUT2RETIRE - COMPLETE NAVIGATION TREE
**Generated:** November 12, 2025

---

## Project Root Structure

```
.
├── .claude/                          # Claude Code configuration
│   ├── commands/
│   │   ├── s2r-checkpoint.md
│   │   └── s2r-safe-return-point.md
│   └── settings.local.json
│
├── .github/                          # GitHub Actions & workflows
│   └── workflows/
│       └── quality-checks.yml
│
├── .vscode/                          # VS Code configuration
│   ├── extensions.json
│   ├── mcp.json
│   ├── mcp.json.template
│   └── settings.json
│
├── anthropic-api/                    # Claude API client
│   └── anthropic-client.js
│
├── archive/                          # Historical code & debug scripts (LARGE - 100+ subdirs)
│   ├── algorithm-refactor-2025-10-15/
│   ├── audit-2025-10-17-cost-scoring/
│   ├── data-utilities/
│   ├── database-dumps/
│   ├── database-test-scripts-2025-10-01/
│   ├── debug-44-percent-bug/        # 40-hour case sensitivity disaster
│   ├── debug-oct-2025/
│   ├── migrations-completed/         # 200+ completed migrations
│   ├── sql-scripts/
│   ├── test-reports-2025-10-17/
│   ├── test-scripts-2025-10-01/
│   └── test-scripts-2025-11-01/
│
├── audit-deep-dive/                  # Admin panel screenshots
│   ├── algorithm-manager.png
│   ├── daily.png
│   ├── data-verification.png
│   ├── paywall-manager.png
│   ├── profile.png
│   ├── region-manager.png
│   └── towns-manager.png
│
├── audit-screenshots/                # UI audit screenshots (37 pages)
│   ├── admin-algorithm-manager.png
│   ├── admin-data-verification.png
│   ├── admin-paywall-manager.png
│   ├── admin-region-manager.png
│   ├── admin-towns-manager.png
│   ├── flow-favorites.png
│   ├── flow-search.png
│   ├── onboarding-administration.png
│   ├── onboarding-climate.png
│   ├── onboarding-complete.png
│   ├── onboarding-costs.png
│   ├── onboarding-culture.png
│   ├── onboarding-current-status.png
│   ├── onboarding-hobbies.png
│   ├── onboarding-progress.png
│   ├── onboarding-region.png
│   ├── onboarding-review.png
│   ├── public-login.png
│   ├── public-reset-password.png
│   ├── public-root-(welcome).png
│   ├── public-signup.png
│   ├── public-welcome.png
│   ├── user-comparison.png
│   ├── user-daily.png
│   ├── user-discover.png
│   ├── user-favorites.png
│   ├── user-journal.png
│   ├── user-profile.png
│   ├── user-schedule.png
│   └── user-scotty-guide.png
│
├── coding-logs/                      # Development session logs
│   ├── 2025-08-29-2241-table-rename-and-s2r-setup.md
│   ├── 2025-09-01-2340-hobby-verification-complete.md
│   ├── 2025-09-04-1047-compound-buttons-persistence-fixed.md
│   ├── 2025-09-04-1500-hobbies-persistence-geographic-inference.md
│   ├── 2025-09-04-1852-hobby-scoring-fixed.md
│   ├── 2025-09-21-2025-cost-data-discovery.md
│   ├── S2R-MANUAL.md
│   └── instructions.md
│
├── database-snapshots/               # 118+ timestamped database backups
│   ├── 2025-08-14T20-13-59/
│   ├── 2025-08-14T23-20-50/
│   ├── 2025-08-15T01-35-33/
│   ├── ... [110+ more snapshots]
│   ├── 2025-11-09T00-25-57/         # Latest snapshot
│   └── 2025-11-12T00-05-32/
│
├── database-utilities/               # Database scripts (500+ files)
│   ├── 00-AUDIT-COMPLETE.md
│   ├── 00-START-HERE.txt
│   ├── *.js                         # Node.js database utilities
│   ├── *.sql                        # SQL migrations & queries
│   ├── *.mjs                        # ESM modules for batch operations
│   ├── add-town.js                  # Add new town helper
│   ├── create-database-snapshot.js  # Backup utility
│   ├── restore-database-snapshot.js # Rollback utility
│   ├── check-*.js                   # Verification scripts
│   ├── fix-*.js                     # Fix scripts
│   ├── verify-*.js                  # Verification scripts
│   └── [490+ more utility files]
│
├── docs/                            # Comprehensive documentation
│   │
│   ├── admin/                       # Admin panel documentation
│   │   ├── MISSING_EDITABLE_FIELDS_ANALYSIS.md
│   │   ├── TOWNS_MANAGER_COMPLETENESS_REPORT.md
│   │   └── TOWNS_MANAGER_FIELD_AUDIT_SUMMARY.md
│   │
│   ├── algorithms/                  # Matching algorithm specs (25+ files)
│   │   ├── ADD_NEW_TOWN_ALGORITHM.md
│   │   ├── ADMIN_SCORE_TRANSPARENCY_DESIGN.md
│   │   ├── COMPONENT_BASED_SCORING.md
│   │   ├── MATCHING_ALGORITHM_GUIDE.md
│   │   ├── MATCHING_ALGORITHM_TECHNICAL.md
│   │   ├── MATCHING_ALGORITHM_WITH_ANTHROPIC.md
│   │   ├── MATCHING_DATABASE_DATA_QUERIES.md
│   │   ├── MATCHING_FREE_DATA_SOURCES.md
│   │   ├── MATCHING_SYSTEM_ANALYSIS_REPORT.md
│   │   ├── PREFERENCE_MATCHING_REFACTOR_PLAN.md
│   │   ├── TOWNS_PREFERENCES_MAPPING_AUGUST_01_2025.md
│   │   ├── TOWNS_PREFERENCES_MAPPING_AUGUST_25_2025.md
│   │   ├── USAGE_GUIDE_ADD_TOWN.md
│   │   └── hobby-scoring-tiered-system.md
│   │
│   ├── analytics/                   # User analytics system
│   │   ├── GEOGRAPHIC_TRACKING.md
│   │   ├── QUICK_START.md
│   │   └── USER_ANALYTICS_SYSTEM.md
│   │
│   ├── architecture/                # System architecture docs
│   │   ├── CLIMATE_VALUES_FIX.md
│   │   ├── COMPARISON_PERSISTENCE_FIX_AUDIT.md
│   │   ├── COMPLETE_AUDIT_ONBOARDING_VALUES.md
│   │   └── REMAINING_FIXES.md
│   │
│   ├── audits/                      # Quality audit reports
│   │   ├── CRITICAL_DROPDOWN_MISMATCH_REPORT.md
│   │   ├── DROPDOWN_AUDIT_SUMMARY.txt
│   │   ├── FINAL_DROPDOWN_AUDIT_REPORT.md
│   │   ├── QUICK_REFERENCE.md
│   │   └── README.md
│   │
│   ├── cleanup/                     # Code cleanup documentation
│   │   ├── CLEANUP_COMPLETE.md
│   │   ├── CLEANUP_PLAN.md
│   │   ├── Cleaning_Onboarding_Data_Values_Aug_28_2025.md
│   │   ├── Master_Cleanup_Plan_V4_FINAL_Aug_28_2025.md
│   │   ├── Master_Cleanup_Plan_V5_AUDITED_Aug_28_2025.md
│   │   ├── SESSION_LEARNINGS_2025-08-29.md
│   │   └── SQL_FILES_ANALYSIS.md
│   │
│   ├── database/                    # Database schema & migrations
│   │   ├── AUDIT_DASHBOARD.txt
│   │   ├── CASE_NORMALIZATION_COMPLETION_REPORT_AUG_26_2025.md
│   │   ├── CATEGORICAL_VALUES_MISMATCH_REPORT.md
│   │   ├── COMPLETE_TOWNS_FIELD_MAPPING.md
│   │   ├── DATA_ALIGNMENT_AUDIT_REPORT.md
│   │   ├── DATA_AUDIT_RUNBOOK.md
│   │   ├── DATA_NORMALIZATION_ACTION_PLAN.md
│   │   ├── DATA_QUALITY_AUDIT_2025-10-19.md
│   │   ├── DATA_QUALITY_SUMMARY.md
│   │   ├── FIELD_EDIT_QUICK_REFERENCE.md
│   │   ├── HOBBIES_MATCHING_DISCUSSION.md
│   │   ├── HOBBY_MATCHING_ANALYSIS.md
│   │   ├── HOBBY_SYSTEM_ENHANCEMENT_TRACKER.md
│   │   ├── HOBBY_VERIFICATION_SYSTEM.md
│   │   ├── MIGRATION_PLAN_GEOGRAPHIC_STANDARDIZATION.md
│   │   ├── PHOTO_MIGRATION_COMPLETE_REPORT.md
│   │   ├── PHOTO_MIGRATION_EXECUTE.md
│   │   ├── PHOTO_MIGRATION_PREFLIGHT.md
│   │   ├── PHOTO_MIGRATION_QUICK_REFERENCE.md
│   │   ├── PHOTO_MIGRATION_VERIFICATION.md
│   │   ├── QUALITY_OF_LIFE_ANALYSIS.md
│   │   ├── README.md
│   │   ├── RLS_ANALYSIS_SUMMARY.txt
│   │   ├── RLS_FIX_QUICK_REFERENCE.md
│   │   ├── RLS_OPTIMIZATION_INDEX.md
│   │   ├── RLS_PERFORMANCE_ANALYSIS.md
│   │   ├── RLS_PERFORMANCE_EXECUTIVE_SUMMARY.md
│   │   ├── RLS_QUALITY_CHECK_REPORT.md
│   │   ├── RLS_QUICK_FIX_MIGRATIONS.md
│   │   ├── RLS_ROOT_CAUSE_ANALYSIS.md
│   │   ├── SUNSHINE_DUPLICATE_FIX_REPORT.md
│   │   ├── TAX_RATES_COLUMN_DELETION_ASSESSMENT.md
│   │   ├── TOWNS_TABLE_COLUMNS.txt
│   │   ├── USER_PREFERENCE_POLLUTION_ANALYSIS_AUG_28_2025.md
│   │   ├── VERIFICATION_QUERIES.sql
│   │   ├── country-language-analysis.json
│   │   ├── table-ownership.md
│   │   └── upper_lower_case_mismatch_cleaning_aug_26_2025.md
│   │
│   ├── project-history/             # Session logs & checkpoints (70+ files)
│   │   ├── LESSONS_LEARNED.md       # ⭐ 10 disasters documented
│   │   ├── 2025-09-05-admin-scoring-investigation.md
│   │   ├── 2025-09-05-data-quality-report.md
│   │   ├── 2025-09-05-towns-data-improvements.md
│   │   ├── 2025-09-21-cost-algorithm-and-data-backfill.md
│   │   ├── 2025-09-22-cost-data-improvements.md
│   │   ├── 2025-09-22-scoring-fix.md
│   │   ├── 2025-09-28-climate-scoring-investigation.md
│   │   ├── 2025-09-29-RECOVERY-CHECKPOINT.md
│   │   ├── 2025-10-16-COST-MATCHING-BUG-FIX.md
│   │   ├── 2025-10-17-admin-score-transparency-and-adjustments.md
│   │   ├── 2025-10-17-component-based-scoring.md
│   │   ├── 2025-10-18-combined-research-edit-modal.md
│   │   ├── 2025-10-18-inline-editing-admin-scores.md
│   │   ├── 2025-11-05_COMPLETE_FIX_SUMMARY.md
│   │   ├── 2025-11-06_ALGORITHM_MANAGER_STATUS.md
│   │   ├── CHECKPOINT-2025-11-06-startup-screen.md
│   │   ├── CHECKPOINT-2025-11-07-CRITICAL-FIX-Match-Scores.md
│   │   ├── CHECKPOINT-2025-11-08-hobbies-exclude-working.md
│   │   ├── CHECKPOINT_2025-10-30_TEMPLATE_SYSTEM_COMPLETE.md
│   │   ├── CHECKPOINT_2025-10-31_AI_RESEARCH_COMPLETE.md
│   │   ├── CHECKPOINT_2025-11-08_Photo-System-Overhaul.md
│   │   ├── CHECKPOINT_2025-11-08_Region-Manager-Enhancement.md
│   │   ├── CHECKPOINT_2025-11-11_Preference-Versioning-Admin-RLS.md
│   │   ├── CHECKPOINT_2025-11-11_Professional-Duplicate-Town-Handling.md
│   │   ├── CHECKPOINT_2025-11-12_Search-System-Anonymous-Analytics.md
│   │   ├── DISASTER_REPORT_2025-11-04.md
│   │   └── [50+ more checkpoint/session files]
│   │
│   ├── recovery/                    # Recovery checkpoints
│   │   ├── 2025-10-26-scotty-security-checkpoint.md
│   │   ├── CHECKPOINT-2025-09-07-0402.md
│   │   ├── CHECKPOINT-2025-10-18-1643.md
│   │   ├── CHECKPOINT-2025-10-20-DATA-QUALITY-COMPLETE.md
│   │   ├── CHECKPOINT-2025-11-06-dropdown-fix.md
│   │   ├── CHECKPOINT_2025-10-26_RLS_OPTIMIZATION.md
│   │   ├── CHECKPOINT_2025-10-27_SYSTEM_STATE.md
│   │   ├── CHECKPOINT_2025-10-28_MIGRATION_COMPLETE.md
│   │   ├── ROLLBACK_PLAN.md
│   │   └── [30+ more recovery files]
│   │
│   ├── technical/                   # Technical guides (80+ files)
│   │   ├── ADMIN_FIELDS_QUICK_REFERENCE.md
│   │   ├── ADMIN_FIELD_METADATA_GUIDE.md
│   │   ├── ADMIN_METADATA_INDEX.md
│   │   ├── ADMIN_SCORING_FIELD_DIAGRAM.md
│   │   ├── ALGORITHM_CLEANUP_2025-10-15.md
│   │   ├── BACKUP-AND-RESTORE-PROCEDURES.md
│   │   ├── CLAUDE-DATABASE-WORKFLOW.md
│   │   ├── DATABASE_QUERY_OPTIMIZATION.md
│   │   ├── DEBUGGING-PATTERNS.md
│   │   ├── ERROR_PREVENTION_ARCHITECTURE.md
│   │   ├── GOOGLE_SEARCH_QUERY_PATTERNS.md
│   │   ├── HOBBIES_DATABASE_SETUP.md
│   │   ├── HYBRID_DATA_ARCHITECTURE.md
│   │   ├── MATCHING_ALGORITHM_FIXES_2025-10-15.md
│   │   ├── NAVIGATION_ARCHITECTURE_2025-10-19.md
│   │   ├── ONBOARDING_COMPLETION_ANALYSIS.md
│   │   ├── PAYWALL-IMPLEMENTATION-GUIDE.md
│   │   ├── QUERY_OPTIMIZATION_QUICK_REFERENCE.md
│   │   ├── SEARCH_FEATURE_ARCHITECTURE.md
│   │   ├── SEARCH_MAP_EXECUTIVE_SUMMARY.md
│   │   ├── SEARCH_MAP_QUICK_START_GUIDE.md
│   │   ├── SECURITY_AUDIT_REPORT.md
│   │   ├── SMART_DAILY_TOWN_DESIGN.md
│   │   ├── TOWNS_SCHEMA_ANALYSIS.md
│   │   ├── UI_CONSISTENCY_FIX_PLAN.md
│   │   ├── VIEWPORT_DETECTION_REFERENCE.md
│   │   └── [60+ more technical docs]
│   │
│   └── [Root-level docs]
│       ├── AI_RESEARCH_V2_IMPROVEMENTS.md
│       ├── CANADIAN_HOME_PRICES_FIXED_2025-10-15.md
│       ├── DATABASE_RUNNER_GUIDE.md
│       ├── DEVELOPMENT_PROCESS.md
│       ├── GROUP_CHAT_GOVERNANCE.md
│       ├── IMAGE_STORAGE_GUIDELINES.md
│       ├── SCOTTY_BROAD_QUERIES_GUIDE.md
│       ├── SCOTTY_PERSONALIZATION_EXAMPLES.md
│       ├── SUPABASE_TOOL_DECISION_TREE.md
│       └── UNSPLASH_SETUP.md
│
├── public/                          # Static assets
│   ├── dark-mode-init.js
│   ├── manifest.json
│   ├── service-worker.js
│   └── vite.svg
│
├── scripts/                         # Build & utility scripts
│   ├── add-hobby-capabilities.sql
│   ├── apply-google-maps-fix.js
│   ├── fix-favorites-foreign-key.js
│   ├── fix-missing-retirement-month.js
│   ├── pre-commit-check.sh
│   ├── verify-navigation.js
│   └── verify-styles.js
│
├── src/                             # ⭐ React application source (PRIMARY CODEBASE)
│   │
│   ├── assets/                      # Static assets
│   │   └── react.svg
│   │
│   ├── components/                  # React components (70+ files)
│   │   │
│   │   ├── TownComparison/          # Town comparison views
│   │   │   ├── CategoryContent.jsx
│   │   │   ├── TownActivities.jsx
│   │   │   ├── TownClimate.jsx
│   │   │   ├── TownCosts.jsx
│   │   │   ├── TownCulture.jsx
│   │   │   ├── TownDemographics.jsx
│   │   │   ├── TownHealthcare.jsx
│   │   │   └── TownOverview.jsx
│   │   │
│   │   ├── admin/                   # Admin panel components (19 files)
│   │   │   ├── ActivitiesPanel.jsx
│   │   │   ├── AddTownModal.jsx
│   │   │   ├── AlertDashboard.jsx
│   │   │   ├── ClimatePanel.jsx
│   │   │   ├── CostsPanel.jsx
│   │   │   ├── CulturePanel.jsx
│   │   │   ├── DismissIssueModal.jsx
│   │   │   ├── HealthcarePanel.jsx
│   │   │   ├── HobbiesDisplay.jsx
│   │   │   ├── InfrastructurePanel.jsx
│   │   │   ├── LegacyFieldsSection.jsx
│   │   │   ├── OverviewPanel.jsx
│   │   │   ├── RatingHistoryPanel.jsx
│   │   │   ├── RegionPanel.jsx
│   │   │   ├── SafetyPanel.jsx
│   │   │   ├── TownAccessManager.jsx
│   │   │   ├── TownPhotoUpload.jsx
│   │   │   ├── UpdateTownModal.jsx
│   │   │   └── UserAnalyticsDashboard.jsx
│   │   │
│   │   ├── chat/                    # Chat/messaging components (12 files)
│   │   │   ├── ChatArea.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── CompanionsModal.jsx
│   │   │   ├── FavoritesTab.jsx
│   │   │   ├── FriendsTab.jsx
│   │   │   ├── GroupsTab.jsx
│   │   │   ├── InviteModal.jsx
│   │   │   ├── LobbyTab.jsx
│   │   │   ├── LoungesTab.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── MessageList.jsx
│   │   │
│   │   ├── onboarding/              # Onboarding flow components
│   │   │   └── SelectionCard.jsx
│   │   │
│   │   ├── search/                  # Search & discovery (5 files)
│   │   │   ├── NearbyMap.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchFilters.jsx
│   │   │   ├── SearchModal.jsx
│   │   │   └── SearchResults.jsx
│   │   │
│   │   └── [50+ shared components]
│   │       ├── AuthenticatedLayout.jsx
│   │       ├── AvatarUpload.jsx
│   │       ├── CompactCountdown.jsx
│   │       ├── ComparePageSpacer.jsx
│   │       ├── ComparisonGrid.jsx
│   │       ├── CustomDropdown.jsx
│   │       ├── DailyTownCard.jsx
│   │       ├── DataQualityDashboard.jsx
│   │       ├── DataQualityPanel.jsx
│   │       ├── EditableDataField.jsx
│   │       ├── FieldDefinitionEditor.jsx
│   │       ├── FilterBarV3.jsx
│   │       ├── FriendsSection.jsx
│   │       ├── GoogleSearchPanel.jsx
│   │       ├── GoogleSearchPopup.jsx
│   │       ├── GroupChatEditModal.jsx
│   │       ├── GroupChatModal.jsx
│   │       ├── HeaderSpacer.jsx
│   │       ├── InitialsAvatar.jsx
│   │       ├── InstallPromptBanner.jsx
│   │       ├── LikeButton.jsx
│   │       ├── Logo.jsx
│   │       ├── NotificationBell.jsx
│   │       ├── OnboardingLayout.jsx
│   │       ├── OptimizedImage.jsx
│   │       ├── PageWithFilters.jsx
│   │       ├── ProTip.jsx
│   │       ├── QuickNav.jsx
│   │       ├── ReportUserModal.jsx
│   │       ├── ScoreBreakdownPanel.jsx
│   │       ├── ScottyGuide.jsx
│   │       ├── ScottyGuideEnhanced.jsx
│   │       ├── SmartFieldEditor.jsx
│   │       ├── StartupScreen.jsx
│   │       ├── SuspenseLoader.jsx
│   │       ├── SwipeableCompareContent.jsx
│   │       ├── SwipeableOnboardingContent.jsx
│   │       ├── TownCard.jsx
│   │       ├── TownCardImageCarousel.jsx
│   │       ├── TownComparison.jsx
│   │       ├── TownImageOverlay.jsx
│   │       ├── TownRadarChart.jsx
│   │       ├── UnifiedErrorBoundary.jsx
│   │       ├── UnifiedHeader.jsx
│   │       ├── UpgradeModal.jsx
│   │       ├── UserActionSheet.jsx
│   │       ├── UsernameSelector.jsx
│   │       └── WikipediaPanel.jsx
│   │
│   ├── config/                      # Application configuration
│   │   └── imageConfig.js           # Photo system config
│   │
│   ├── contexts/                    # React Contexts (5 files)
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   ├── OnboardingContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── useTheme.js
│   │
│   ├── data/                        # Static data
│   │   ├── MIGRATION_INSTRUCTIONS.md
│   │   ├── countries.js
│   │   ├── curatedTownImages.js
│   │   └── regionalInspirationsData.json
│   │
│   ├── hooks/                       # Custom React hooks (25+ files)
│   │   ├── useChatActions.js
│   │   ├── useChatDataLoader.js
│   │   ├── useChatDataLoaders.js
│   │   ├── useChatOperations.jsx
│   │   ├── useChatPermissions.js
│   │   ├── useChatState.js
│   │   ├── useChatStateOptimized.js
│   │   ├── useChatSubscriptions.js
│   │   ├── useChatToggles.js
│   │   ├── useFieldDefinitions.js
│   │   ├── useGeolocation.js
│   │   ├── useHideOnScroll.js
│   │   ├── useInstallPrompt.js
│   │   ├── useInvitationHandlers.jsx
│   │   ├── useMobileDetection.js
│   │   ├── useModerationActions.js
│   │   ├── useOnboardingAutoSave.js
│   │   ├── useOnlineTracking.js
│   │   ├── useStandaloneMode.js
│   │   ├── useUserActions.js
│   │   └── useUsernameCheck.js
│   │
│   ├── pages/                       # Page components
│   │   │
│   │   ├── admin/                   # Admin pages (6 files)
│   │   │   ├── AlgorithmManager.jsx
│   │   │   ├── DataVerification.jsx
│   │   │   ├── PaywallManager.jsx
│   │   │   ├── RegionManager.jsx
│   │   │   ├── TemplateManager.jsx
│   │   │   └── TownsManager.jsx
│   │   │
│   │   ├── onboarding/              # Onboarding pages (10 pages)
│   │   │   ├── OnboardingAdministration.jsx
│   │   │   ├── OnboardingClimate.jsx
│   │   │   ├── OnboardingComplete.jsx
│   │   │   ├── OnboardingCosts.jsx
│   │   │   ├── OnboardingCulture.jsx
│   │   │   ├── OnboardingCurrentStatus.jsx
│   │   │   ├── OnboardingHobbies.jsx
│   │   │   ├── OnboardingProgress.jsx
│   │   │   ├── OnboardingRegion.jsx
│   │   │   └── OnboardingReview.jsx
│   │   │
│   │   └── [Main pages - 14 files]
│   │       ├── Chat.jsx
│   │       ├── Daily.jsx
│   │       ├── Favorites.jsx
│   │       ├── HeaderMockup.jsx
│   │       ├── Home.jsx
│   │       ├── Journal.jsx
│   │       ├── Login.jsx
│   │       ├── MasterSchedule.jsx
│   │       ├── ProfileUnified.jsx
│   │       ├── ResetPassword.jsx
│   │       ├── Settings.jsx
│   │       ├── SignupEnhanced.jsx
│   │       ├── TownComparison.jsx
│   │       ├── TownDiscovery.jsx
│   │       └── Welcome.jsx
│   │
│   ├── services/                    # Business logic services
│   │   └── chatDataService.js
│   │
│   ├── styles/                      # CSS & styling (7 files)
│   │   ├── DESIGN_STANDARDS.md
│   │   ├── enhanced-sliders.css
│   │   ├── fonts.css
│   │   ├── iosHeader.css
│   │   ├── leaflet-overrides.css
│   │   ├── safeArea.css
│   │   └── uiConfig.ts              # Design tokens (colors, spacing, etc.)
│   │
│   ├── utils/                       # ⭐ Utility functions (CRITICAL - 80+ files)
│   │   │
│   │   ├── admin/                   # Admin utilities (4 files)
│   │   │   ├── __tests__/
│   │   │   │   └── adminFieldMetadata.test.js
│   │   │   ├── adminFieldMetadata.js
│   │   │   ├── bulkUpdateTown.js
│   │   │   ├── outlierDetection.js
│   │   │   └── townDataAudit.js
│   │   │
│   │   ├── data/
│   │   │   └── isoMappings.js
│   │   │
│   │   ├── hobbies/
│   │   │   └── compoundButtonMappings.js
│   │   │
│   │   ├── scoring/                 # ⭐⭐⭐ MATCHING ALGORITHM (CORE)
│   │   │   │
│   │   │   ├── categories/          # Category-specific scoring (6 files)
│   │   │   │   ├── adminScoring.js
│   │   │   │   ├── climateScoring.js
│   │   │   │   ├── costScoring.js
│   │   │   │   ├── cultureScoring.js
│   │   │   │   ├── hobbiesScoring.js
│   │   │   │   └── regionScoring.js
│   │   │   │
│   │   │   ├── core/
│   │   │   │   └── calculateMatch.js    # Main algorithm entry point
│   │   │   │
│   │   │   ├── helpers/             # Scoring helpers (15+ files)
│   │   │   │   ├── adjacencyMatcher.js
│   │   │   │   ├── arrayMatching.js
│   │   │   │   ├── calculateHealthcareScore.js
│   │   │   │   ├── calculateSafetyScore.js
│   │   │   │   ├── climateInference.js
│   │   │   │   ├── cultureInference.js
│   │   │   │   ├── gradualScoring.js
│   │   │   │   ├── hobbiesInference.js
│   │   │   │   ├── hobbiesMatching.js
│   │   │   │   ├── preferenceParser.js
│   │   │   │   ├── stringUtils.js
│   │   │   │   └── taxScoring.js
│   │   │   │
│   │   │   ├── QUERY_PATTERNS_QUICK_REFERENCE.md
│   │   │   ├── cacheBuster.js
│   │   │   ├── config.js
│   │   │   ├── fieldQueryPatterns.js
│   │   │   ├── fieldQueryPatterns.test.js
│   │   │   ├── index.js
│   │   │   ├── matchDisplayHelpers.js
│   │   │   ├── matchingAlgorithm.js
│   │   │   └── unifiedScoring.js
│   │   │
│   │   ├── userpreferences/
│   │   │   ├── onboardingUtils.js
│   │   │   └── userPreferences.js
│   │   │
│   │   ├── validation/
│   │   │   ├── aiResultValidator.js
│   │   │   └── categoricalValues.js  # Valid dropdown values
│   │   │
│   │   └── [40+ shared utility files]
│   │       ├── _REORG_SAFETY.md
│   │       ├── accountTiers.js
│   │       ├── aiResearch.js
│   │       ├── auditTown.js
│   │       ├── authUtils.js
│   │       ├── browserUtils.js
│   │       ├── chatUtils.js
│   │       ├── companionUtils.js
│   │       ├── constants.js
│   │       ├── dataVerification.js
│   │       ├── emailUtils.js
│   │       ├── fieldCategories.js
│   │       ├── geographicMappings.js
│   │       ├── imageOptimization.js
│   │       ├── imageValidation.js
│   │       ├── journalUtils.js
│   │       ├── paywallUtils.js
│   │       ├── platformDetection.js
│   │       ├── preferenceUtils.js
│   │       ├── sanitizeUtils.js
│   │       ├── scottyContext.js
│   │       ├── scottyDatabase.js
│   │       ├── scottyGeographicKnowledge.js
│   │       ├── scottyPreferenceValidator.js
│   │       ├── searchUtils.js
│   │       ├── supabaseAdmin.js
│   │       ├── supabaseClient.js      # ⭐ Database client
│   │       ├── themeUtils.js
│   │       ├── townColumnSets.js      # ⭐ Column definitions
│   │       ├── townDataOptions.js
│   │       ├── townDisplayUtils.js
│   │       ├── townUtils.jsx
│   │       ├── userSearchUtils.js
│   │       ├── usernameGenerator.js
│   │       ├── versionCheck.js
│   │       └── waterBodyMappings.js
│   │
│   ├── App.jsx                      # Main app component
│   ├── index.css                    # Global styles
│   └── main.jsx                     # App entry point
│
├── supabase/                        # Supabase backend
│   │
│   ├── functions/                   # Edge functions (TypeScript)
│   │   ├── ai-populate-new-town/
│   │   │   ├── index.ts             # AI town population
│   │   │   ├── index.ts.bak
│   │   │   ├── index.ts.bak2
│   │   │   └── index.ts.bak3
│   │   ├── ai-populate-new-town-v2/
│   │   │   └── index.ts
│   │   ├── ai-research-field/
│   │   │   └── index.ts             # AI research
│   │   ├── chat-with-scotty/
│   │   │   └── index.ts             # AI chatbot (Scotty)
│   │   └── find-user-by-email/
│   │       └── index.ts
│   │
│   ├── migrations/                  # Database migrations (150+ files)
│   │   ├── 20240622_create_user_search.sql
│   │   ├── 20250113_fix_image_double_slashes.sql
│   │   ├── 20251001_add_nova_scotia_towns.sql
│   │   ├── 20251002030500_create_notifications.sql
│   │   ├── 20251002040000_privacy_remove_fullname.sql
│   │   ├── 20251002050000_return_username_not_email.sql
│   │   ├── 20251003020000_enable_realtime_for_chat.sql
│   │   ├── 20251004051700_user_roles_paywall_system.sql
│   │   ├── 20251006000000_user_blocks_and_reports.sql
│   │   ├── 20251007000000_group_chats.sql
│   │   ├── 20251007010000_group_chat_metadata.sql
│   │   ├── 20251007020000_group_chat_privacy.sql
│   │   ├── 20251007030000_fix_group_chat_policies.sql
│   │   ├── 20251007040000_group_tier_system.sql
│   │   ├── 20251008000000_fix_enforce_admin_ratio.sql
│   │   ├── 20251009000000_user_likes.sql
│   │   ├── 20251009020000_country_likes.sql
│   │   ├── 20251017000000_admin_score_adjustments.sql
│   │   ├── 20251018000000_add_airport_distance_split.sql
│   │   ├── 20251018022700_add_is_excluded_to_towns_hobbies.sql
│   │   ├── 20251018033300_create_user_town_access.sql
│   │   ├── 20251018044000_fix_users_rls_for_admin_role.sql
│   │   ├── 20251018060000_add_missing_admin_panel_columns.sql
│   │   ├── 20251019230000_user_analytics_system.sql
│   │   ├── 20251019233000_add_geographic_tracking.sql
│   │   ├── 20251019235000_enhanced_device_tracking.sql
│   │   ├── 20251020000000_add_english_proficiency.sql
│   │   ├── 20251020001000_add_visa_free_days.sql
│   │   ├── 20251026201801_apply_rls_strategic_fix_v2.sql
│   │   ├── 20251028000000_preference_versioning.sql
│   │   ├── 20251028010000_preference_versioning_triggers.sql
│   │   ├── 20251028020000_preference_change_tracking.sql
│   │   ├── 20251101000000_add_templates_metadata_columns.sql
│   │   ├── 20251102000000_create_field_templates.sql
│   │   ├── 20251102010000_add_template_metadata_to_towns.sql
│   │   ├── 20251106000000_startup_screen.sql
│   │   ├── 20251107000000_add_photo_order_column.sql
│   │   ├── 20251107010000_photo_sync_triggers.sql
│   │   ├── 20251108000000_photo_system_overhaul.sql
│   │   ├── 20251111000000_admin_rls_access.sql
│   │   ├── 20251111010000_duplicate_town_handling.sql
│   │   ├── 20251112000000_search_system_analytics.sql
│   │   └── [120+ more migration files...]
│   │
│   └── .temp/                       # Supabase CLI temp files
│       ├── cli-latest
│       ├── gotrue-version
│       ├── pooler-url
│       ├── postgres-version
│       ├── project-ref
│       ├── rest-version
│       ├── storage-migration
│       └── storage-version
│
├── [Root level documentation - 100+ .md files]
│   ├── ADMIN_ACCESS_INVESTIGATION_REPORT.md
│   ├── ADMIN_FIELD_METADATA_DELIVERABLE.md
│   ├── ADMIN_PANEL_FIELD_AUDIT.md
│   ├── AI_RESEARCH_SETUP.md
│   ├── AUDIT_DEEP_DIVE_REPORT.md
│   ├── AUDIT_INDEX.md
│   ├── AUDIT_REPORT.md
│   ├── AUDIT_SUMMARY.md
│   ├── CATEGORICAL_VALUES_AUDIT.md
│   ├── CHAT_COMPONENT_HIERARCHY.md
│   ├── CHAT_REFACTORING_SUMMARY.md
│   ├── CLAUDE.md                    # ⭐⭐⭐ MAIN PROJECT GUIDE
│   ├── COLUMN_NAME_AUDIT.md
│   ├── COMPREHENSIVE_UI_UX_AUDIT_REPORT.md
│   ├── DATABASE_OPTIMIZATION_REPORT.md
│   ├── DEPLOYMENT_COMPLETE.md
│   ├── DROPDOWN_AUDIT_REPORT.md
│   ├── FIX_ALGORITHM_MANAGER_RLS.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── LATEST_CHECKPOINT.md         # ⭐⭐⭐ CURRENT STATE REFERENCE
│   ├── LESSONS-LEARNED-NULL-BACKFILL.md
│   ├── LICENSE
│   ├── MIGRATION_INSTRUCTIONS.md
│   ├── MIGRATION_SUCCESS_REPORT.md
│   ├── NOVA-SCOTIA-IMPLEMENTATION-PLAN.md
│   ├── PHOTO_MIGRATION_SUMMARY.md
│   ├── PHOTO_SYSTEM_EXECUTIVE_SUMMARY.md
│   ├── POST_MIGRATION_TESTING.md
│   ├── PRE_PRODUCTION_QUALITY_AUDIT.md
│   ├── PUBLISH_UNPUBLISH_FEATURE.md
│   ├── README.md
│   ├── RLS_ANALYSIS_UPDATE_OCT26.md
│   ├── RLS_VERIFICATION_REPORT.md
│   ├── TEMPLATE_SYSTEM_FINAL_SUMMARY.md
│   ├── TOWNS_FIELD_AUDIT_SUMMARY.md
│   ├── VALIDATION_COMPLETENESS_AUDIT.md
│   └── [80+ more .md documentation files]
│
├── [Root level scripts - 50+ .js files]
│   ├── add-column-via-function.js
│   ├── add-is-excluded-column.js
│   ├── analyze-rls-detailed.js
│   ├── analyze-rls-from-migrations.js
│   ├── analyze-rls-gap.js
│   ├── analyze-rls-policies.js
│   ├── apply-preference-migration.js
│   ├── apply-rls-fix.js
│   ├── audit-dropdown-rendering.js
│   ├── audit-dropdown-validation.js
│   ├── audit-ui-comprehensive.js
│   ├── audit-ui-deep-dive.js
│   ├── backfill-paywall-limits.js
│   ├── check-*.js                   # Various check scripts
│   ├── create-database-snapshot.js  # ⭐ Backup utility
│   ├── fix-*.js                     # Various fix scripts
│   ├── restore-database-snapshot.js # ⭐ Rollback utility
│   ├── test-*.js                    # Various test scripts
│   └── [30+ more utility scripts]
│
├── [Root level images - 20+ .png screenshots]
│   ├── after-refresh.png
│   ├── after-selections.png
│   ├── algorithm-direct.png
│   ├── algorithm-dropdown-fixed.png
│   ├── algorithm-enhanced.png
│   ├── algorithm-manager-test.png
│   ├── algorithm-searchable.png
│   ├── algorithm-working.png
│   └── [12+ more UI screenshots]
│
├── [Configuration files]
│   ├── .env                         # Environment variables (local, gitignored)
│   ├── .env.example                 # Environment template
│   ├── .gitattributes
│   ├── .gitignore
│   ├── .supabase-project-ref
│   ├── backup-everything.sh
│   ├── eslint.config.js
│   ├── imageConfig.js
│   ├── package.json                 # ⭐ Dependencies & scripts
│   ├── package-lock.json
│   ├── playwright.config.ts         # E2E testing config
│   ├── postcss.config.cjs
│   ├── tailwind.config.js           # ⭐ Tailwind CSS config
│   ├── tsconfig.json
│   └── vite.config.js               # ⭐ Vite build config
│
└── [Excluded from tree]
    ├── node_modules/                # Dependencies (excluded - ~500MB)
    ├── .git/                        # Git repository (excluded)
    ├── dist/                        # Build output (excluded)
    ├── build/                       # Build artifacts (excluded)
    ├── .pw-user/                    # Playwright cache (excluded)
    └── .pw-user-a/                  # Playwright cache (excluded)
```

---

## Key Statistics

- **Total Directories**: ~200+
- **Total Files**: ~2000+ (excluding node_modules)
- **Database Snapshots**: 118+
- **Database Migrations**: 150+
- **Documentation Files**: 200+
- **React Components**: 70+
- **Utility Functions**: 80+
- **Archive Scripts**: 500+
- **Lines of Code**: ~50,000+ (estimated)

---

## Critical Paths for Development

### **1. Project Rules & Guidelines**
- `CLAUDE.md` - Main project guide, all rules and architecture
- `LATEST_CHECKPOINT.md` - Current state reference
- `docs/project-history/LESSONS_LEARNED.md` - 10 disasters documented

### **2. Main Application Logic**
- `src/App.jsx` - Main app component
- `src/main.jsx` - App entry point
- `src/components/` - All React components
- `src/pages/` - Page-level components

### **3. Matching Algorithm (CORE BUSINESS LOGIC)**
- `src/utils/scoring/` - Entire scoring directory ⭐⭐⭐
- `src/utils/scoring/core/calculateMatch.js` - Algorithm entry point
- `src/utils/scoring/categories/` - Category-specific scoring
- `src/utils/scoring/helpers/` - Scoring helper functions

### **4. Database & API**
- `src/utils/supabaseClient.js` - Database client
- `src/utils/supabaseAdmin.js` - Admin client (server-side)
- `src/utils/townColumnSets.js` - Column set definitions
- `supabase/migrations/` - Database migrations

### **5. Data Validation & Configuration**
- `src/utils/validation/categoricalValues.js` - Valid dropdown values
- `src/config/imageConfig.js` - Photo system config
- `tailwind.config.js` - Design system config
- `src/styles/uiConfig.ts` - UI design tokens

### **6. Admin Panel**
- `src/pages/admin/AlgorithmManager.jsx` - Admin scoring interface
- `src/pages/admin/TownsManager.jsx` - Town management
- `src/pages/admin/DataVerification.jsx` - Data quality dashboard
- `src/components/admin/` - Admin panel components

### **7. Database Utilities**
- `database-utilities/create-database-snapshot.js` - Create backup
- `database-utilities/restore-database-snapshot.js` - Restore backup
- `database-utilities/add-town.js` - Add new town helper
- `database-utilities/` - 500+ utility scripts

### **8. Documentation**
- `docs/algorithms/MATCHING_ALGORITHM_GUIDE.md` - Algorithm documentation
- `docs/technical/` - Technical guides (80+ files)
- `docs/project-history/` - Checkpoint reports (70+ files)
- `docs/database/` - Database schema docs

---

## Navigation Tips

### **Starting Development?**
Read in order:
1. `CLAUDE.md` - Project rules and absolute prohibitions
2. `LATEST_CHECKPOINT.md` - Current system state
3. `docs/project-history/LESSONS_LEARNED.md` - Disaster prevention

### **Working on Database?**
1. **ALWAYS** run `node database-utilities/create-database-snapshot.js` FIRST
2. Make changes
3. Test
4. Create checkpoint if successful

### **Adding Features?**
1. Check `src/components/` for existing patterns
2. Follow `src/styles/DESIGN_STANDARDS.md`
3. Use patterns from similar components (be a professional copycat)

### **Debugging Issues?**
1. Check `docs/project-history/` for similar past issues
2. Review `docs/project-history/LESSONS_LEARNED.md` for common pitfalls
3. Use Playwright for UI issues: `npx playwright screenshot`

### **Modifying Scoring Algorithm?**
1. Start at `src/utils/scoring/index.js`
2. Trace to specific category in `src/utils/scoring/categories/`
3. Check helper functions in `src/utils/scoring/helpers/`
4. Test with real data before deploying

### **Understanding Data Structure?**
1. `src/utils/townColumnSets.js` - What columns exist
2. `src/utils/validation/categoricalValues.js` - Valid values
3. `docs/database/TOWNS_TABLE_COLUMNS.txt` - Full schema
4. `supabase/migrations/` - How schema evolved

---

## Tech Stack Summary

### **Frontend**
- React 18.2.0
- Vite 6.3.5
- Tailwind CSS 3.3.3
- React Router 6.10.0
- Lucide React (icons)

### **Backend**
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Row Level Security (RLS) - 262+ policies
- TypeScript Edge Functions

### **AI/ML**
- Anthropic Claude API (Haiku model)
- AI research & town population
- Chatbot (Scotty)

### **Development**
- ESLint 9.25.0
- Playwright 1.56.0 (E2E testing)
- PostCSS with Tailwind

### **Design System**
- iOS-inspired design (8-point grid)
- Custom sage green brand colors
- Dark mode support
- Mobile-first responsive

---

## File Naming Conventions

### **Documentation**
- `UPPERCASE_WITH_UNDERSCORES.md` - Major documentation
- `lowercase-with-hyphens.md` - Technical guides
- `YYYYMMDD_description.md` - Timestamped checkpoints

### **Code**
- `PascalCase.jsx` - React components
- `camelCase.js` - Utilities and helpers
- `kebab-case.css` - Style files
- `SCREAMING_SNAKE.sql` - Important SQL files

### **Scripts**
- `verb-noun-description.js` - Action scripts (e.g., `fix-missing-fields.js`)
- `test-*.js` - Test scripts
- `check-*.js` - Verification scripts
- `verify-*.js` - Validation scripts

---

## Common Operations Quick Reference

### **Create Database Backup**
```bash
node database-utilities/create-database-snapshot.js
```

### **Restore Database**
```bash
node database-utilities/restore-database-snapshot.js [timestamp]
```

### **Start Development Server**
```bash
npm run dev
```

### **Run Tests**
```bash
npm run verify:all
```

### **Create Checkpoint**
```bash
git add -A
git commit -m "[EMOJI] CHECKPOINT: Description"
git push origin main
# Then update LATEST_CHECKPOINT.md
```

### **Take UI Screenshot (Playwright)**
```bash
npx playwright screenshot http://localhost:5173
```

### **Add New Town**
```bash
node database-utilities/add-town.js
```

---

## Important Notes

### **⚠️ CRITICAL WARNINGS**

1. **NEVER** use `SELECT *` from towns table (170+ columns)
   - Use `src/utils/townColumnSets.js` column sets instead

2. **ALWAYS** create database snapshot before schema changes
   - Run `node database-utilities/create-database-snapshot.js`

3. **NEVER** hardcode values
   - Use centralized config files
   - Use `src/utils/validation/categoricalValues.js` for valid values

4. **ALWAYS** use `.toLowerCase()` for string comparisons
   - See LESSONS_LEARNED.md for 40-hour disaster story

5. **Database metrics in docs are DATED**
   - ALWAYS query live database for current counts
   - Check LATEST_CHECKPOINT.md for recent state

### **🎯 Success Patterns**

- Database snapshot discipline (118+ snapshots created)
- Professional git commit messages with emojis
- Comprehensive documentation culture
- Active cleanup of completed migrations
- Centralized design system
- Security-first (262+ RLS policies)

### **📊 Project Status (as of Nov 12, 2025)**

- **Production Ready**: 92/100 (A-)
- **Towns**: 351+ (growing)
- **Users**: 27+ active
- **Hobbies**: 190 (109 universal, 81 location-specific)
- **Performance**: A+ Lighthouse scores (95/100)
- **Security**: Critical issues fixed, RLS audited

---

## Conclusion

This navigation tree represents a **production-ready retirement destination matching platform** with:

- Sophisticated matching algorithm
- Comprehensive admin tools
- Robust security (RLS)
- Extensive documentation
- Professional disaster recovery
- Active maintenance culture

**Key Insight**: The massive archive and documentation indicate a project that learned from mistakes, documented everything, and built systems to prevent future disasters. The 118+ database snapshots and LESSONS_LEARNED.md are evidence of a disciplined, professional approach to development.

---

**Generated by:** Claude Code (Anthropic)
**Date:** November 12, 2025
**Project:** Scout2Retire - Retirement Destination Matching Platform
**Version:** Current workspace snapshot
