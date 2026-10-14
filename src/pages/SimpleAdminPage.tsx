import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { District, MasterSchoolListItem, FullSchoolRegistration } from '../types';

export const SimpleAdminPage: React.FC = () => {
  const [schools, setSchools] = useState<MasterSchoolListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | District>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'pending'>('all');

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllParticipatingSchoolsWithStatus();
      setSchools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Filter schools
  const filtered = schools.filter((item) => {
    const dist = item.participatingSchool.district;
    if (selectedDistrict !== 'all' && dist !== selectedDistrict) return false;

    if (statusFilter === 'submitted' && !item.registration) return false;
    if (statusFilter === 'pending' && item.registration) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sName = item.participatingSchool.school_name.toLowerCase();
      const mName = item.registration?.mentor.full_name?.toLowerCase() || '';
      const stuMatch = item.registration?.students.some(s => s.full_name?.toLowerCase().includes(q));
      const regId = item.registration?.school.registration_id?.toLowerCase() || '';

      return sName.includes(q) || mName.includes(q) || stuMatch || regId.includes(q);
    }

    return true;
  });

  // Direct download helper
  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) return;

    // If data URL or direct file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'District',
      'School Name',
      'Registration ID',
      'Mentor Name',
      'Mentor Phone',
      'Mentor Email',
      'Mentor Designation',
      'Student 1 Name',
      'Student 1 Class',
      'Student 2 Name',
      'Student 2 Class',
      'Student 3 Name',
      'Student 3 Class',
      'Student 4 Name',
      'Student 4 Class',
      'Status'
    ];

    const rows = filtered.map(item => [
      `"${item.participatingSchool.district}"`,
      `"${item.participatingSchool.school_name}"`,
      `"${item.registration?.school.registration_id || 'N/A'}"`,
      `"${item.registration?.mentor.full_name || 'N/A'}"`,
      `"${item.registration?.mentor.phone || 'N/A'}"`,
      `"${item.registration?.mentor.email || 'N/A'}"`,
      `"${item.registration?.mentor.designation || 'N/A'}"`,
      `"${item.registration?.students[0]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[0]?.class_name || 'N/A'}"`,
      `"${item.registration?.students[1]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[1]?.class_name || 'N/A'}"`,
      `"${item.registration?.students[2]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[2]?.class_name || 'N/A'}"`,
      `"${item.registration?.students[3]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[3]?.class_name || 'N/A'}"`,
      `"${item.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Team_Tameer_Registrations_${selectedDistrict}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = schools.length;
  const submittedCount = schools.filter(s => s.registration).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-9 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
            <img src="/logo.png" alt="Team Tameer Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
            <img src="/logo2.jpeg" alt="Event Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Team Tameer Admin Panel
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Registrations & Documents
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
              Real-time portal to view official school delegations and download student & mentor verified credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadSchools}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* District Filter Cards (Large Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={() => setSelectedDistrict('all')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span>All Districts</span>
            <Building2 className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">36</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">{submittedCount} submitted</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDistrict('Kolhapur')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'Kolhapur'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Kolhapur</span>
            <MapPin className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">16</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">Schools roster</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDistrict('Sangli')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'Sangli'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Sangli</span>
            <MapPin className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">12</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">Schools roster</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDistrict('Satara')}
          className={`p-5 sm:p-7 rounded-3xl border-2 text-left transition-all cursor-pointer ${
            selectedDistrict === 'Satara'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xl scale-[1.02]'
              : 'bg-white hover:bg-purple-50/50 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-1.5">
              Satara
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded">New</span>
            </span>
            <MapPin className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">8</p>
          <p className="text-xs sm:text-sm font-semibold opacity-75 mt-0.5">Includes Wai & Mahabaleshwar</p>
        </button>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name, mentor, student name, or registration ID..."
            className="w-full pl-12 pr-5 py-3.5 border-2 border-slate-200 rounded-2xl text-sm sm:text-base font-semibold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto border-2 border-slate-200 rounded-2xl text-sm sm:text-base py-3.5 px-5 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-600 transition-all cursor-pointer"
          >
            <option value="all">All Schools ({filtered.length})</option>
            <option value="submitted">Submitted Applications Only</option>
            <option value="pending">Pending Registrations</option>
          </select>
        </div>
      </div>

      {/* Registrations List (Large Cards) */}
      <div className="space-y-6">
        {filtered.map((item) => {
          const hasReg = Boolean(item.registration);
          const school = item.registration?.school;
          const mentor = item.registration?.mentor;
          const studentsList = item.registration?.students || [];

          return (
            <div
              key={item.participatingSchool.id}
              className={`bg-white rounded-3xl border-2 p-6 sm:p-9 shadow-sm transition-all ${
                hasReg ? 'border-slate-200 hover:border-blue-300 hover:shadow-md' : 'border-slate-200/70 bg-slate-50/60 opacity-80'
              }`}
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b-2 border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                    item.participatingSchool.district === 'Kolhapur'
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                      : item.participatingSchool.district === 'Sangli'
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border-2 border-purple-200'
                  }`}>
                    {item.participatingSchool.district} District
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                    {item.participatingSchool.school_name}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {school?.registration_id ? (
                    <span className="font-mono text-sm sm:text-base font-black text-blue-700 bg-blue-50 border-2 border-blue-200 px-4 py-1.5 rounded-xl shadow-2xs">
                      ID: {school.registration_id}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 font-semibold italic bg-slate-100 px-3.5 py-1.5 rounded-xl">
                      Not Yet Registered
                    </span>
                  )}
                </div>
              </div>

              {hasReg && school && mentor ? (
                /* Submitted Details */
                <div className="mt-6 space-y-6">
                  {/* Faculty Mentor Information & Document Downloads */}
                  <div className="p-5 sm:p-7 bg-slate-50/90 rounded-2xl border-2 border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-emerald-600" />
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                          Faculty Mentor In-Charge
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm bg-white border border-slate-200 px-3 py-1 rounded-lg font-bold text-slate-700 shadow-2xs">
                        {mentor.designation || 'In-Charge Faculty'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div>
                        <p className="font-black text-slate-900 text-base sm:text-xl">{mentor.full_name}</p>
                        <div className="text-slate-600 text-sm sm:text-base font-semibold flex flex-wrap items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {mentor.phone}</span>
                          {mentor.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {mentor.email}</span>}
                        </div>
                      </div>

                      {/* Mentor Documents Download Buttons */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {mentor.photo_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(mentor.photo_path!, `${mentor.full_name}_Photo.jpg`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 text-blue-700 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-2xs cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Mentor Photo</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No Photo</span>
                        )}

                        {mentor.id_document_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(mentor.id_document_path!, `${mentor.full_name}_IDProof.pdf`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-300 text-emerald-700 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-2xs cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Mentor ID Document</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No ID Proof</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Student Delegates with Document Download Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Registered 4 Student Delegates & Uploaded Documents</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                      {studentsList.map((stu, sIdx) => (
                        <div
                          key={stu.id || sIdx}
                          className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-3.5 shadow-sm hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="font-black text-xs text-slate-600 uppercase tracking-wide">
                              Student #{sIdx + 1}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                              {stu.class_name || 'Class 10'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {stu.photo_path ? (
                              <img
                                src={stu.photo_path}
                                alt={stu.full_name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border-2 border-purple-100 flex items-center justify-center font-black text-sm">
                                #{sIdx + 1}
                              </div>
                            )}
                            <p className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                              {stu.full_name || 'Student Name'}
                            </p>
                          </div>

                          {/* Student Document Downloads */}
                          <div className="pt-2 border-t-2 border-slate-100 flex flex-col gap-2">
                            {stu.photo_path && (
                              <button
                                type="button"
                                onClick={() => handleDownload(stu.photo_path!, `${stu.full_name}_Photo.jpg`)}
                                className="w-full text-left inline-flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-slate-200/80 cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Download Photo</span>
                                </span>
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {stu.school_id_document_path && (
                              <button
                                type="button"
                                onClick={() => handleDownload(stu.school_id_document_path!, `${stu.full_name}_SchoolID.pdf`)}
                                className="w-full text-left inline-flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold transition-colors border border-slate-200/80 cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Download School ID</span>
                                </span>
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {!stu.photo_path && !stu.school_id_document_path && (
                              <span className="text-xs text-slate-400 italic font-medium py-1">No files uploaded</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Not registered placeholder */
                <div className="mt-4 py-4 text-center text-sm text-slate-400 font-semibold italic bg-slate-50/70 rounded-2xl border border-slate-200">
                  This school has not submitted their registration yet.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
