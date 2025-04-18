import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';  // Make sure the path is correct

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service
    const authToken = this.auth.getAuthorizationToken();

    // Log the token to check if it's being retrieved
    console.log('AuthInterceptor triggered');
    console.log('Auth token:', authToken);

    // If there's a token, add the Authorization header
    if (authToken) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Log the cloned request to verify the headers
      console.log('Cloned request with Authorization header:', authReq);

      // Send cloned request with the new header to the next handler
      return next.handle(authReq);
    }

    // Log if there is no token
    console.log('No auth token, sending original request');

    // If no token, just send the original request
    return next.handle(req);
  }
}
