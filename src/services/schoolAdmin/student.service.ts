import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface Student {
  StId: number;
  FirstName: string;
  LastName: string;
  StudentId: string;
  Grade?: string;
  StudentEmail: string;
  StudentPhoneNo?: string;
  ParentName?: string;
  ParentPhoneNo?: string;
  SchoolId: number;
  school?: {
    SchoolId: number;
    SchoolName: string;
    SchoolEmail: string;
  };
}

export interface CreateStudentRequest {
  FirstName: string;
  LastName: string;
  StudentId: string;
  Grade?: string;
  StudentEmail: string;
  StudentPassword: string;
  StudentPhoneNo?: string;
  ParentName?: string;
  ParentPhoneNo?: string;
  SchoolId: number;
}

export interface UpdateStudentRequest {
  FirstName?: string;
  LastName?: string;
  StudentId?: string;
  Grade?: string;
  StudentEmail?: string;
  StudentPassword?: string;
  StudentPhoneNo?: string;
  ParentName?: string;
  ParentPhoneNo?: string;
  SchoolId?: number;
}

export interface CreateStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: Student;
    user: {
      UserId: number;
      UserName: string;
      Email: string;
      Role: string;
      SchoolId: number;
    };
  };
}

export interface StudentsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  message: string;
  data: Student;
}

export interface DeleteStudentResponse {
  success: boolean;
  message: string;
  data: {
    StId: number;
    FirstName: string;
    LastName: string;
    StudentId: string;
  };
}

class StudentService extends BaseRequestService {
  // Create a new student and corresponding user
  createStudent(data: CreateStudentRequest): Promise<CreateStudentResponse> {
    return this.post(`${API_URL}/api/students`, data);
  }

  // Get all students
  getAllStudents(): Promise<StudentsResponse> {
    return this.get(`${API_URL}/api/students`);
  }

  // Get student by ID
  getStudentById(id: number): Promise<StudentResponse> {
    return this.get(`${API_URL}/api/students/${id}`);
  }

  // Get students by school ID
  getStudentsBySchool(schoolId: number): Promise<StudentsResponse> {
    return this.get(`${API_URL}/api/students/school/${schoolId}`);
  }

  // Get students by grade
  getStudentsByGrade(grade: string): Promise<StudentsResponse> {
    return this.get(`${API_URL}/api/students/grade/${grade}`);
  }

  // Update student by ID
  updateStudent(id: number, data: UpdateStudentRequest): Promise<StudentResponse> {
    return this.put(`${API_URL}/api/students/${id}`, data);
  }

  // Delete student by ID
  deleteStudent(id: number): Promise<DeleteStudentResponse> {
    return this.delete(`${API_URL}/api/students/${id}`);
  }
}

export default new StudentService();
