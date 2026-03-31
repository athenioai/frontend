import { MockLeadService } from './mock/lead-service'
import { MockCampaignService } from './mock/campaign-service'
import { MockAnalyticsService } from './mock/analytics-service'
import { MockAlertService } from './mock/alert-service'
import { MockEmpresaService } from './mock/empresa-service'
import { MockAdminService } from './mock/admin-service'
import { MockAuthService } from './mock/auth-service'

// Swap these imports to Supabase implementations when ready.
// Components that consume these services won't need any changes.

export const leadService = new MockLeadService()
export const campaignService = new MockCampaignService()
export const analyticsService = new MockAnalyticsService()
export const alertService = new MockAlertService()
export const empresaService = new MockEmpresaService()
export const adminService = new MockAdminService()
export const authService = new MockAuthService()
