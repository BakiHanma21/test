import { Routes } from '@angular/router';
import { AddWorkComponent } from './component_skilledWorker/add-work/add-work.component';
import { CalendarComponent } from './component_skilledWorker/calendar/calendar.component';
import { WorkerTransactionComponent } from './component_skilledWorker/transaction/transaction.component';
import { WorkerProfileComponent } from './component_skilledWorker/worker-profile/worker-profile.component';
import { WorkerRequestListComponent1 } from './component_skilledWorker/worker-request-list/worker-request-list.component';
import { WorkerMessagesComponent } from './component_skilledWorker/worker-messages/worker-messages.component';

import { AboutUsComponent } from './component_userpage/about-us/about-us.component';
import { BookingComponent } from './component_userpage/booking/booking.component';
import { ContactUsComponent } from './component_userpage/contact-us/contact-us.component';
import { FavoritesComponent } from './component_userpage/home/favorites/favorites.component';
import { HomeComponent } from './component_userpage/home/home.component';
import { MessageComponent } from './component_userpage/message/message.component';
import { ReportingMessageComponent } from './component_userpage/reporting-message/reporting-message.component';
import { TransactionComponent } from './component_userpage/transaction/transaction.component';
import { UserMessagesComponent } from './component_userpage/user-messages/user-messages.component';
import { UserProfileComponent } from './component_userpage/user-profile/user-profile.component';

import { ChoicesComponent } from './Log_Reg/choices/choices.component';
import { ForgotPasswordComponent } from './Log_Reg/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Log_Reg/reset-password/reset-password.component';

import { AuthGuard } from './services/auth.guard';
import { LandingPageComponent } from './Log_Reg/landing-page/landing-page.component';

import { LoginComponent } from './Log_Reg/login/login.component';
import { SkilledRegistrationComponent } from './Log_Reg/skilled-registration/skilled-registration.component';
import { UserRegistrationComponent } from './Log_Reg/user-registration/user-registration.component';

import { TermsAndConditionsComponent } from './Log_Reg/terms-conditions/terms-conditions.component';
import { PaymentHistoryComponent } from './payments/payment-history/payment-history.component';
import { PaymentComponent } from './payments/payment/payment.component';
import { PaymenthomeComponent } from './payments/paymenthome/paymenthome.component';
import { SettingsComponent } from './settings/settings.component';
// import { ChatComponent } from './components/chat/chat.component';

import { RoleBasedAccessControlComponent } from './user-management-system/role-based-access-control/role-based-access-control.component';
import { UserVerificationComponent } from './user-management-system/user-verification/user-verification.component';
import { ProfileManagementComponent } from './user-management-system/profile-management/profile-management.component';
import { DashboardManagementComponent } from './user-management-system/dashboard-management/dashboard-management.component';
import { AdminMessagesComponent } from './user-management-system/admin-messages/admin-messages.component';
import { ReportedAreaComponent } from './user-management-system/reported-area/reported-area.component';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]  },
  { path: 'contact_us', component: ContactUsComponent, canActivate: [AuthGuard]  },
  { path: 'about_us', component: AboutUsComponent, canActivate: [AuthGuard]  },
  { path: 'login', component: LoginComponent },
  { path: 'user-registration', component: UserRegistrationComponent },
  { path: 'terms-conditions', component: TermsAndConditionsComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'skilled-registration', component: SkilledRegistrationComponent },
  { path: 'choices', component: ChoicesComponent },
  { path: 'user-messages', component: UserMessagesComponent},
  { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent},
  // { path: 'chat', component: ChatComponent},
  // { path: 'chat/:receiverId', component: ChatComponent },

  { path: 'user-messages/:receiverId', component: UserMessagesComponent},
  { path: 'user-messages/:receiverId', component: UserMessagesComponent },

  { path: 'worker-messages', component: WorkerMessagesComponent },
  { path: 'worker-messages/:receiverId', component: WorkerMessagesComponent},
  
  { path: 'admin-messages', component: AdminMessagesComponent },
  { path: 'admin-messages/:receiverId', component: AdminMessagesComponent},

  { path: 'book', component: BookingComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'payment-history', component: PaymentHistoryComponent, canActivate: [AuthGuard] },
  { path: 'transaction', component: TransactionComponent, canActivate: [AuthGuard] },
  { path: 'worker-transaction', component: WorkerTransactionComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: WorkerProfileComponent, canActivate: [AuthGuard] },
  { path: 'bookings', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'user_request', component: WorkerRequestListComponent1, canActivate: [AuthGuard] },
  { path: 'worker-messages', component: WorkerMessagesComponent},

  // Admin routes
  { path: 'role-based-access-control', component: RoleBasedAccessControlComponent, canActivate: [AuthGuard] },
  { path: 'user-verification', component: UserVerificationComponent, canActivate: [AuthGuard] },
  { path: 'profile-management', component: ProfileManagementComponent, canActivate: [AuthGuard] },
  { path: 'dashboard-management', component: DashboardManagementComponent, canActivate: [AuthGuard] },
  { path: 'admin-messages', component: AdminMessagesComponent, canActivate: [AuthGuard]},

  // Default route
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
