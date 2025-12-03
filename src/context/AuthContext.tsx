import axios from 'axios';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Server } from '../Server/Server';

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
  _id?: string
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
  _jobId: string;
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
      const response = await axios.post(Server + "User/login", {
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
      const response = await axios.post(Server + "User/register", {
        name,
        email,
        password,
        role
      });

      const { token, user, message } = response.data;

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
      const response = await axios.post(Server +"company/create", jobData, {
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
      const response = await axios.get(Server +"company/get");
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
      const response = await axios.put(Server +`company/update/${id}`, jobData, {
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
      await axios.delete(Server +`company/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Deleting company ID:", id);
      setJobs(prev => prev.filter(job => job.id !== id));
      setApplications(prev => prev.filter(app => app.jobId !== id));
      toast.success("Job deleted successfully!");
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job");
    }
  };

const applyToJob = async (jobId: string, resume?: File) => {
  if (!user) return;

  try {
    const formData = new FormData();
    formData.append("jobId", jobId);
    if (resume) formData.append("resume", resume);

    const token = localStorage.getItem("token");

    const response = await axios.post(Server +"candidate/apply", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(response.data.message || "Application submitted!");
  } catch (error) {
    console.error("Apply error:", error);
    toast.error("Failed to apply to job");
  }
};

const fetchApplications = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(Server +"candidate/my-applications", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { applications } = response.data;

    // If response has _id instead of id, normalize:
    const formatted = applications.map((app: any) => ({
      id: app._id,
      jobId: typeof app.jobId === "object" ? app.jobId._id : app.jobId,
      candidateId: app.candidateId,
      status: app.status,
      resume: app.resume,
      appliedDate: app.appliedDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    setApplications(formatted);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    toast.error("Could not fetch applications.");
  }
};

useEffect(() => {
  fetchJobs();
  if (user?.role === 'candidate') {
    fetchApplications();
  }
}, [user]);

const fetchCompanyApplications = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(Server +"candidate/company-applications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { applications } = response.data;

    const formatted = applications.map((app: any) => ({
      id: app._id,
      jobId: typeof app.jobId === "object" ? app.jobId._id : app._jobId,
      candidateId: app.candidateId,
      status: app.status,
      resume: app.resume,
      appliedDate: app.appliedDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    setApplications(formatted);
  } catch (error) {
    console.error("Failed to fetch company applications:", error);
    toast.error("Could not load company applications");
  }
};

useEffect(() => {
  fetchJobs();

  if (user?.role === "candidate") {
    fetchApplications();
  } else if (user?.role === "company") {
    fetchCompanyApplications();
  }
}, [user]);

const bookmarkJob = async (jobId: string) => {
  if (!user || user.role !== "candidate") return;

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      Server +"bookmark/toggle",
      { jobId }, // ✅ jobId sent in body as JSON
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // ✅ ensure it's JSON
        },
      }
    );

    const { bookmarks } = response.data;

    const normalizedBookmarks = bookmarks.map((job: any) =>
      typeof job === "string" ? job : job._id || job.id
    );

    setBookmarkedJobs(normalizedBookmarks);
    toast.success("Bookmark updated!");
  } catch (error: any) {
    console.error("Bookmark error:", error.response?.data || error.message);
    toast.error("Failed to update bookmark");
  }
};



const fetchBookmarks = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(Server +"bookmark/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { bookmarks } = response.data;
    setBookmarkedJobs(bookmarks);
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    toast.error("Could not load bookmarks");
  }
};

useEffect(() => {
  fetchJobs();

  if (user?.role === "candidate") {
    fetchApplications();
    fetchBookmarks(); // 👈 Fetch bookmarks
  } else if (user?.role === "company") {
    fetchCompanyApplications();
  }
}, [user]);


const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      Server +`candidate/update-status/${applicationId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const updatedApp = response.data.updatedApp;

    // Update state
    setApplications(prev =>
      prev.map(app => app.id === applicationId ? { ...app, status: updatedApp.status } : app)
    );

    toast.success("Application status updated");
  } catch (error) {
    console.error("Failed to update status:", error);
    toast.error("Status update failed");
  }
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