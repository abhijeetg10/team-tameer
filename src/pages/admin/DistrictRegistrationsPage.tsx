import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  School as SchoolIcon,
  LayoutGrid,
  List
} from 'lucide-react';
import { api, OFFICIAL_PARTICIPATING_SCHOOLS } from '../../lib/api';
import { MasterSchoolListItem, RegistrationStatus, District, FullSchoolRegistration } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { generateAcknowledgementPDF } from '../../lib/pdfGenerator';
import { DocumentPreviewModal } from '../../components/ui/DocumentPreviewModal';

export const DistrictRegistrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<MasterSchoolListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | District>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; type: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllParticipatingSchoolsWithStatus();
      setSchools(data);
    } catch (err) {
      console.error('Failed to load district schools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items based on District, Status, and Search Query
  const filteredSchools = schools.filter((item) => {
    const district = item.participatingSchool.district;
    const schoolName = item.participatingSchool.school_name;

    // District filter
    if (selectedDistrict !== 'all' && district !== selectedDistrict) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'registered') {
        if (!item.registration) return false;
      } else if (statusFilter === 'unregistered') {
        if (item.registration) return false;
      } else if (item.status !== statusFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const schoolNameMatch = schoolName.toLowerCase().includes(q);
      const districtMatch = district.toLowerCase().includes(q);
      const regIdMatch = item.registration?.school.registration_id?.toLowerCase().includes(q);
      const principalMatch = item.registration?.school.principal_name?.toLowerCase().includes(q);
      const mentorMatch = item.registration?.mentor.full_name?.toLowerCase().includes(q);
      const studentMatch = item.registration?.students.some(s => s.full_name?.toLowerCase().includes(q));

      return schoolNameMatch || districtMatch || regIdMatch || principalMatch || mentorMatch || studentMatch;
    }

    return true;
  });

  // Calculate District Counts
  const kolhapurSchools = schools.filter(s => s.participatingSchool.district === 'Kolhapur');
  const sangliSchools = schools.filter(s => s.participatingSchool.district === 'Sangli');
  const sataraSchools = schools.filter(s => s.participatingSchool.district === 'Satara');

  const getDistrictRegisteredCount = (districtList: MasterSchoolListItem[]) => {
    return districtList.filter(s => s.registration && s.status !== 'draft').length;
  };

  // Quick CSV Export
  const handleExportCSV = () => {
    const headers = [
      'District',
      'School Name',
      'Registration Status',
      'Registration ID',
      'Principal Name',
      'School Email',
      'Contact Number',
      'Mentor Name',
      'Mentor Phone',
      'Student 1',
      'Student 2',
      'Student 3'
    ];

    const rows = filteredSchools.map(item => [
      `"${item.participatingSchool.district}"`,
      `"${item.participatingSchool.school_name}"`,
      `"${item.status}"`,
      `"${item.registration?.school.registration_id || 'N/A'}"`,
      `"${item.registration?.school.principal_name || 'N/A'}"`,
      `"${item.registration?.school.school_email || 'N/A'}"`,
      `"${item.registration?.school.contact_number || 'N/A'}"`,
      `"${item.registration?.mentor.full_name || 'N/A'}"`,
      `"${item.registration?.mentor.phone || 'N/A'}"`,
      `"${item.registration?.students[0]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[1]?.full_name || 'N/A'}"`,
      `"${item.registration?.students[2]?.full_name || 'N/A'}"`,
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

  return (
    <div className="space-y-6">
      {/* Page Title & Branding */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Dedicated Admin Panel
            </span>
            <span className="text-xs text-slate-500 font-medium">District-Wise Roster</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            District-Wise School Registrations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse all accredited schools separately across Kolhapur, Sangli, and Satara. Track team submissions, verify mentors & 4 student delegates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Data
          </Button>
          <Button
            size="sm"
            variant="navy"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* District Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* All Districts Tab */}
        <button
          type="button"
          onClick={() => setSelectedDistrict('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedDistrict === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900 ring-offset-2'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">All Districts</span>
            <Building2 className={`w-4 h-4 ${selectedDistrict === 'all' ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{schools.length}</span>
            <span className="text-xs opacity-75">Schools</span>
          </div>
          <p className="text-[11px] mt-1 opacity-70">
            {getDistrictRegisteredCount(schools)} submitted
          </p>
        </button>

        {/* Kolhapur Tab */}
        <button
          type="button"
          onClick={() => setSelectedDistrict('Kolhapur')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedDistrict === 'Kolhapur'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600 ring-offset-2'
              : 'bg-white hover:bg-blue-50/50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Kolhapur</span>
            <MapPin className={`w-4 h-4 ${selectedDistrict === 'Kolhapur' ? 'text-white' : 'text-blue-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{kolhapurSchools.length}</span>
            <span className="text-xs opacity-75">Schools</span>
          </div>
          <p className="text-[11px] mt-1 opacity-70">
            {getDistrictRegisteredCount(kolhapurSchools)} submitted
          </p>
        </button>

        {/* Sangli Tab */}
        <button
          type="button"
          onClick={() => setSelectedDistrict('Sangli')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedDistrict === 'Sangli'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600 ring-offset-2'
              : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Sangli</span>
            <MapPin className={`w-4 h-4 ${selectedDistrict === 'Sangli' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{sangliSchools.length}</span>
            <span className="text-xs opacity-75">Schools</span>
          </div>
          <p className="text-[11px] mt-1 opacity-70">
            {getDistrictRegisteredCount(sangliSchools)} submitted
          </p>
        </button>

        {/* Satara Tab */}
        <button
          type="button"
          onClick={() => setSelectedDistrict('Satara')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedDistrict === 'Satara'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-600 ring-offset-2'
              : 'bg-white hover:bg-purple-50/50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Satara</span>
              <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                +2 New
              </span>
            </div>
            <MapPin className={`w-4 h-4 ${selectedDistrict === 'Satara' ? 'text-white' : 'text-purple-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black">{sataraSchools.length}</span>
            <span className="text-xs opacity-75">Schools</span>
          </div>
          <p className="text-[11px] mt-1 opacity-70">
            Includes Wai & Mahabaleshwar
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name, principal, mentor, student name, or registration ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="registered">Registered Teams (Active)</option>
            <option value="approved">Approved</option>
            <option value="under_review">Under Review</option>
            <option value="submitted">Submitted</option>
            <option value="correction_required">Correction Required</option>
            <option value="unregistered">Pending Registration (Not Started)</option>
          </select>

          {/* Card vs Table toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'cards' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Individual Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === 'table' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Compact Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredSchools.length}</strong> of <strong>{schools.length}</strong> schools in {selectedDistrict === 'all' ? 'All Districts' : `${selectedDistrict} District`}
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:underline font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {filteredSchools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schools match the selected filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or choosing a different district or status.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedDistrict('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        /* INDIVIDUAL REGISTRATION CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchools.map((item) => {
            const hasReg = Boolean(item.registration);
            const isApproved = item.status === 'approved';
            const isUnderReview = item.status === 'under_review';
            const isCorrection = item.status === 'correction_required';
            const schoolId = item.participatingSchool.id;
            const district = item.participatingSchool.district;
            const schoolName = item.participatingSchool.school_name;

            return (
              <div 
                key={schoolId}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  hasReg 
                    ? isApproved 
                      ? 'border-emerald-200 hover:border-emerald-300' 
                      : isCorrection 
                      ? 'border-orange-200 hover:border-orange-300 bg-orange-50/20' 
                      : 'border-blue-200 hover:border-blue-300' 
                    : 'border-slate-200 opacity-80 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Top Header: District & Status */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        district === 'Kolhapur' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : district === 'Sangli' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {district} District
                      </span>
                      {item.registration?.school.registration_id && (
                        <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.registration.school.registration_id}
                        </span>
                      )}
                    </div>
                    <Badge status={item.status} />
                  </div>

                  {/* School Name */}
                  <div className="mt-3">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {schoolName}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>Code: {item.registration?.school.school_code || 'Unassigned'}</span>
                      {item.registration?.school.principal_name && (
                        <>
                          <span>•</span>
                          <span>Principal: <strong>{item.registration.school.principal_name}</strong></span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Team Details (If registered) */}
                  {hasReg && item.registration ? (
                    <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                      {/* Mentor Badge */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.registration.mentor.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={item.registration.mentor.full_name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-[11px]">
                              {item.registration.mentor.full_name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Mentor • {item.registration.mentor.designation || 'Faculty'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-mono">
                          {item.registration.mentor.phone}
                        </div>
                      </div>

                      {/* 4 Student Delegates Mini List */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>4 Student Delegates</span>
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {item.registration.students.map((stu, i) => (
                            <div 
                              key={`${schoolId}-stu-${stu.id || i}`}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-[11px]"
                            >
                              <img
                                src={stu.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={stu.full_name}
                                className="w-5 h-5 rounded-md object-cover border border-slate-200"
                              />
                              <div className="min-w-0 flex-1 truncate">
                                <p className="font-semibold text-slate-800 text-[10px] truncate">
                                  {stu.full_name}
                                </p>
                                <p className="text-[9px] text-slate-400 truncate">
                                  {stu.class_name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correction remarks if any */}
                      {isCorrection && item.registration.school.correction_remarks && (
                        <div className="p-2 bg-orange-100/70 border border-orange-200 rounded-lg text-[10px] text-orange-900">
                          <strong>Admin Correction Note: </strong>
                          {item.registration.school.correction_remarks}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Not yet registered placeholder */
                    <div className="mt-4 p-4 bg-slate-100/60 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-600">Pending School Representative</p>
                      <p className="text-[10px] text-slate-400">
                        This institution has not yet initiated their team registration portal.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {hasReg && item.registration ? (
                    <>
                      <button
                        type="button"
                        onClick={() => generateAcknowledgementPDF(item.registration!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                        title="Download Official Registration PDF Pass"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pass PDF</span>
                      </button>

                      <Link
                        to={`/admin/school/${item.registration.school.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs"
                      >
                        <span>Review Application</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-400 italic">Not Registered</span>
                      <Link
                        to={`/admin/school/new?preselect=${schoolId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Details</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">School Name</th>
                  <th className="px-4 py-3">Reg ID</th>
                  <th className="px-4 py-3">Mentor</th>
                  <th className="px-4 py-3">4 Students</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((item) => (
                  <tr key={item.participatingSchool.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.participatingSchool.district === 'Kolhapur' 
                          ? 'bg-blue-50 text-blue-700' 
                          : item.participatingSchool.district === 'Sangli' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {item.participatingSchool.district}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.participatingSchool.school_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.registration?.school.principal_name ? `Principal: ${item.registration.school.principal_name}` : 'Awaiting registration'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {item.registration?.school.registration_id || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.registration?.mentor ? (
                        <div>
                          <p className="font-semibold text-slate-800">{item.registration.mentor.full_name}</p>
                          <p className="text-[10px] text-slate-400">{item.registration.mentor.phone}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.registration?.students && item.registration.students.length > 0 ? (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {item.registration.students.map((s, idx) => (
                            <img
                              key={`${item.participatingSchool.id}-stu-${s.id || idx}`}
                              src={s.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                              alt={s.full_name}
                              title={`${s.full_name} (${s.class_name})`}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">0 / 4</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.registration ? (
                        <Link
                          to={`/admin/school/${item.registration.school.id}`}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Review
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">Not claimed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={true}
          title={previewDoc.title}
          documentUrl={previewDoc.url}
          documentType={previewDoc.type}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
