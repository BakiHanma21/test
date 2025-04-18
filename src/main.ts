import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideAnimations(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, 
    },
  ],
}).then(() => console.log('AuthInterceptor registered'))
  .catch((err) => console.error(err));
