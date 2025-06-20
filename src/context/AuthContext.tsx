import axios from 'axios';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';

export type UserRole = 'candidate' | 'company' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
}

export interface Job {
  _id?:string
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  companyId: string;
  isBookmarked?: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedDate: string;
  resume?: string;
}

interface AuthContextType {
  user: User | null;
  jobs: Job[];
  applications: Application[];
  bookmarkedJobs: string[];
  fetchJobs: () => void;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => void;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  applyToJob: (jobId: string, resume?: File) => void;
  bookmarkJob: (jobId: string) => void;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await axios.post("http://localhost:5000/User/login", {
        email,
        password,
        role,
      });
      const { token, user } = response.data;

      if (token && user) {
    localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
setUser(user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
  try {
    const response = await axios.post('http://localhost:5000/User/register', {
      name,
      email,
      password,
      role
    });

    const { token, user, message } = response.data;

    // ✅ Optional: Show success toast
    toast.success(message || 'Registration successful!');

    // ✅ Store token
    localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
setUser(user);

    return true;
  } catch (error: any) {
    // ✅ Optional: Show error toast if message available
    const errorMessage = error?.response?.data?.message || 'Registration failed';
    toast.error(errorMessage);

    console.error('Registration failed:', error);
    return false;
  }
};

useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (token && storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null);
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/company/create", jobData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(prev => [response.data.companyPost, ...prev]);
      toast("create a sussefully")
    } catch (error) {
      console.error("Failed to add job:", error);
    }
  };

  const fetchJobs = async () => {
  try {
    const response = await axios.get("http://localhost:5000/company/get");
    const data = response.data;
    if (Array.isArray(data)) {
      setJobs(data);
    } else if (Array.isArray(data.jobs)) {
      setJobs(data.jobs);
    } else {
      console.error("Unexpected jobs response format:", data);
      setJobs([]);
      toast.error("Unexpected jobs data format");
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    toast.error("Failed to fetch jobs");
  }
};
  useEffect(() => {
    fetchJobs(); // load jobs from backend again on reload
  }, []);


const updateJob = async (id: string, jobData: Partial<Job>) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`http://localhost:5000/company/update/${id}`, jobData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setJobs(prev => prev.map(job => job.id === id ? response.data.updatedCompany : job));
    toast.success("Job updated successfully!");
  } catch (error) {
    console.error("Failed to update job:", error);
    toast.error("Failed to update job");
  }
};

const deleteJob = async (id: string) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/company/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setJobs(prev => prev.filter(job => job.id !== id));
    setApplications(prev => prev.filter(app => app.jobId !== id));
    toast.success("Job deleted successfully!");
  } catch (error) {
    console.error("Failed to delete job:", error);
    toast.error("Failed to delete job");
  }
};

  const applyToJob = (jobId: string, resume?: File) => {
    if (!user) return;

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId,
      candidateId: user.id,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      ...(resume && { resume: resume.name })
    };
    setApplications(prev => [...prev, newApplication]);
  };

  const bookmarkJob = (jobId: string) => {
    setBookmarkedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const updateApplicationStatus = (applicationId: string, status: Application['status']) => {
    setApplications(prev =>
      prev.map(app => app.id === applicationId ? { ...app, status } : app)
    );
  };

  return (
    <AuthContext.Provider value={{
      user,
      jobs,
      applications,
      bookmarkedJobs,
      fetchJobs,
      login,
      register,
      logout,
      addJob,
      updateJob,
      deleteJob,
      applyToJob,
      bookmarkJob,
      updateApplicationStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}