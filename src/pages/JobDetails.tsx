import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Heart, Building2, Calendar, Users, Upload, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { jobs, user, bookmarkJob, bookmarkedJobs, applyToJob, applications } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  const job = jobs.find(j => j.id === id);
  const isBookmarked = bookmarkedJobs.includes(id || '');
  const hasApplied = applications.some(app => app.jobId === id && app.candidateId === user?.id);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-500">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const handleBookmark = () => {
    if (user?.role === 'candidate') {
      bookmarkJob(job.id);
    }
  };

  const handleApply = () => {
    if (resume || coverLetter) {
      applyToJob(job.id, resume || undefined);
      setShowApplyModal(false);
      setResume(null);
      setCoverLetter('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Jobs
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <p className="text-blue-100 text-lg font-medium">{job.company}</p>
                </div>
              </div>
              {user?.role === 'candidate' && (
                <button
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isBookmarked
                      ? 'text-red-500 bg-white/20 hover:bg-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-blue-200" />
                <span className="text-blue-100">{job.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-blue-200" />
                <span className="text-blue-100">{job.type}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-blue-200" />
                <span className="text-blue-100 font-semibold">{job.salary}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose max-w-none text-gray-700">
                    <p>{job.description}</p>
                    <p className="mt-4">
                      We are looking for a passionate and skilled professional to join our growing team. 
                      This role offers exciting opportunities to work on cutting-edge projects and contribute 
                      to innovative solutions that make a real impact.
                    </p>
                  </div>
                </section>

                {/* Requirements */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Benefits */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
                  <ul className="space-y-3">
                    {[
                      'Competitive salary and comprehensive benefits',
                      'Flexible working hours and remote work options',
                      'Professional development and learning opportunities',
                      'Health, dental, and vision insurance',
                      'Paid time off and holidays',
                      'Collaborative and inclusive work environment'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Apply Button */}
                {user?.role === 'candidate' && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    {hasApplied ? (
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Application Submitted
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Your application has been successfully submitted. We'll be in touch soon!
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowApplyModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                )}

                {/* Job Info */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Job Information</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium text-gray-900">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Job Type</span>
                    <span className="font-medium text-gray-900">{job.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium text-gray-900">{job.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Salary</span>
                    <span className="font-medium text-gray-900">{job.salary}</span>
                  </div>
                </div>

                {/* Company Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About {job.company}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {job.company} is a leading company in the industry, committed to innovation and excellence. 
                    We value our employees and provide a supportive work environment for professional growth.
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>50-200 employees</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for {job.title}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {resume ? resume.name : 'Click to upload your resume'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're perfect for this role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!resume && !coverLetter}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}