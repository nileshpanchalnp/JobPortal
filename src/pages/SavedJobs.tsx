
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/Common/JobCard';

export default function SavedJobs() {
  const { jobs, bookmarkedJobs } = useAuth();
const savedJobs = jobs.filter(job => {
  const jobId = job._id || job.id;
  return (bookmarkedJobs ?? []).includes(jobId);
});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Jobs
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
              <Heart className="h-8 w-8 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="text-gray-600 mt-1">
                {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {savedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No saved jobs yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start browsing jobs and save the ones you're interested in. 
              They'll appear here for easy access later.
            </p>
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <span>Browse Jobs</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}