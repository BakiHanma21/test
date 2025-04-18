export interface Request {
    id: number;          // Unique identifier for the request
    user: string;        // Name of the user who created the request
    task: string;        // Description of the task or service needed
    date: string;        // Date the task is requested for (in ISO format or human-readable)
    status?: string;     // Optional: Status of the request (e.g., "Pending", "Approved", "Declined")
  }
  