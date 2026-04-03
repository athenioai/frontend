import { SupabaseLeadService } from './supabase/lead-service'
import { SupabaseCampaignService } from './supabase/campaign-service'
import { SupabaseAnalyticsService } from './supabase/analytics-service'
import { SupabaseAlertService } from './supabase/alert-service'
import { SupabaseCompanyService } from './supabase/company-service'
import { SupabaseAdminService } from './supabase/admin-service'
import { SupabaseAuthService } from './supabase/auth-service'

export const leadService = new SupabaseLeadService()
export const campaignService = new SupabaseCampaignService()
export const analyticsService = new SupabaseAnalyticsService()
export const alertService = new SupabaseAlertService()
export const companyService = new SupabaseCompanyService()
export const adminService = new SupabaseAdminService()
export const authService = new SupabaseAuthService()
