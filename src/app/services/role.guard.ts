import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const requiredRole = next.data['role'] as string;
    const currentRole = this.authService.getUserRole();

    if (currentRole === requiredRole || requiredRole === 'admin') {
      return true;
    }

    // Redirect to home or login if access is denied
    this.router.navigate(['/login']);
    return false;
  }
}
