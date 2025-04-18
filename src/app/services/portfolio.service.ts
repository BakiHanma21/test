import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  private apiUrl = 'http://localhost/Service_express_api_sw';  // API base URL

  constructor(private http: HttpClient) { }

  submitPortfolioData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }
  // Personal Profile CRUD Methods
  createPersonalProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getPersonalProfiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personalProfile`);
  }

  updatePersonalProfile(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/personalProfile/${id}`, data);
  }

  deletePersonalProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/personalProfile/${id}`);
  }

  // Skills CRUD Methods
  createSkill(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getSkills(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/skills`);
  }

  updateSkill(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/skills/${id}`, data);
  }

  deleteSkill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/skills/${id}`);
  }

  // Work Experience CRUD Methods
  createWorkExperience(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getWorkExperiences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/workExperience`);
  }

  updateWorkExperience(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/workExperience/${id}`, data);
  }

  deleteWorkExperience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/workExperience/${id}`);
  }

  // Projects CRUD Methods
  createProject(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`);
  }

  updateProject(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/${id}`, data);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`);
  }

  // Clients CRUD Methods
  createClient(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients`);
  }

  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clients/${id}`, data);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${id}`);
  }

  // Educational Qualifications CRUD Methods
  createEducationalQualification(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getEducationalQualifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/educationalQualifications`);
  }

  updateEducationalQualification(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/educationalQualifications/${id}`, data);
  }

  deleteEducationalQualification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/educationalQualifications/${id}`);
  }

  // Testimonials CRUD Methods
  createTestimonial(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/testimonials`);
  }

  updateTestimonial(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/testimonials/${id}`, data);
  }

  deleteTestimonial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/testimonials/${id}`);
  }

  // Creative Elements CRUD Methods
  createCreativeElement(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getCreativeElements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/creativeElements`);
  }

  updateCreativeElement(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/creativeElements/${id}`, data);
  }

  deleteCreativeElement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/creativeElements/${id}`);
  }

  // Additional Personal Touches CRUD Methods
  createPersonalTouch(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getPersonalTouches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personalTouches`);
  }

  updatePersonalTouch(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/personalTouches/${id}`, data);
  }

  deletePersonalTouch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/personalTouches/${id}`);
  }

  // Professional Branding CRUD Methods
  createBranding(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getBrandings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/branding`);
  }

  updateBranding(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/branding/${id}`, data);
  }

  deleteBranding(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/branding/${id}`);
  }

  // Future Goals CRUD Methods
  createFutureGoal(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getFutureGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/futureGoals`);
  }

  updateFutureGoal(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/futureGoals/${id}`, data);
  }

  deleteFutureGoal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/futureGoals/${id}`);
  }

  // Resume CRUD Methods
  createResume(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert.php`, data);
  }

  getResumes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/resume`);
  }

  updateResume(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/resume/${id}`, data);
  }

  deleteResume(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/resume/${id}`);
  }
}
