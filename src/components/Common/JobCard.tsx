import React from 'react';
import { MapPin, Clock, DollarSign, Heart, Building2 } from 'lucide-react';
import { Job } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  showBookmark?: boolean;
}

export default function JobCard({ job, showBookmark = true }: JobCardProps) {
  const { user, bookmarkJob, bookmarkedJobs } = useAuth();
  const isBookmarked = bookmarkedJobs.includes(job.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === 'candidate') {
      bookmarkJob(job.id);
    }
  };

  return (
    <Link to={`/job/${job.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600 font-medium">{job.company}</p>
            </div>
          </div>
          {showBookmark && user?.role === 'candidate' && (
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-all duration-200 ${
                isBookmarked
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">{job.type}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm font-medium">{job.salary}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.requirements.slice(0, 3).map((req, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
            >
              {req}
            </span>
          ))}
          {job.requirements.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              +{job.requirements.length - 3} more
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Posted {new Date(job.postedDate).toLocaleDateString()}
          </span>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}