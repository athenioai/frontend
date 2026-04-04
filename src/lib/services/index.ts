import { LeadService } from './lead-service'
import { CampaignService } from './campaign-service'
import { AnalyticsService } from './analytics-service'
import { AlertService } from './alert-service'
import { CompanyService } from './company-service'
import { AdminService } from './admin-service'
import { AuthService } from './auth-service'
import { HealthService } from './health-service'

export const leadService = new LeadService()
export const campaignService = new CampaignService()
export const analyticsService = new AnalyticsService()
export const alertService = new AlertService()
export const companyService = new CompanyService()
export const adminService = new AdminService()
export const authService = new AuthService()
export const healthService = new HealthService()
