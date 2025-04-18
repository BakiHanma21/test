// worker.model.ts
export interface Work {
  title: string;
  description?: string;
}

export interface Worker {
  name: string;
  location: string;
  availability?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  workImage?:string;
  mapsLink?: string;
  workDone?: string;
  skills?:string;
  experience?: number;
  works: Work[];
}
