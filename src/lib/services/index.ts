import { AuthService } from './auth-service'
import { ChatService } from './chat-service'
import { AppointmentService } from './appointment-service'
import { CalendarConfigService } from './calendar-config-service'

export const authService = new AuthService()
export const chatService = new ChatService()
export const appointmentService = new AppointmentService()
export const calendarConfigService = new CalendarConfigService()
