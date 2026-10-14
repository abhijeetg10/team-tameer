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
  School as SchoolIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import { api, OFFICIAL_PARTICIPATING_SCHOOLS } from '../../lib/api';
import { MasterSchoolListItem, RegistrationStatus, District } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [masterItems, setMasterItems] = useState<MasterSchoolListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllParticipatingSchoolsWithStatus();
      setMasterItems(data);
    } catch (err) {
      console.error('Failed to load master schools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute 7 real-time overview counts
  const totalParticipatingSchools = masterItems.length || 36; // 36
  
  // Schools that have actually submitted (Submitted, Under Review, Correction, Approved)
  const fullyRegisteredSchools = masterItems.filter(item => 
    item.registration && ['submitted', 'under_review', 'correction_required', 'approved'].includes(item.status)
  ).length;

  const notYetRegisteredSchools = totalParticipatingSchools - fullyRegisteredSchools;

  // Active registrations
  const totalStudents = masterItems.reduce((acc, item) => 
    acc + (item.registration?.students?.filter(s => s.full_name)?.length || 0), 0
  );

  const totalMentors = masterItems.reduce((acc, item) => 
    acc + (item.registration?.mentor?.full_name ? 1 : 0), 0
  );

  const pendingApprovals = masterItems.filter(item => 
    item.status === 'submitted' || item.status === 'under_review'
  ).length;

  const approvedRegistrations = masterItems.filter(item => 
    item.status === 'approved'
  ).length;

  // District-wise statistics
  const getDistrictStats = (districtName: District) => {
    const totalInDistrict = masterItems.filter(i => i.participatingSchool.district === districtName).length;
    const registeredInDistrict = masterItems.filter(i => 
      i.participatingSchool.district === districtName &&
      i.registration && 
      ['submitted', 'under_review', 'correction_required', 'approved'].includes(i.status)
    ).length;
    const remainingInDistrict = totalInDistrict - registeredInDistrict;
    const percentage = totalInDistrict > 0 ? Math.round((registeredInDistrict / totalInDistrict) * 100) : 0;
    return { total: totalInDistrict, registered: registeredInDistrict, remaining: remainingInDistrict, percentage };
  };

  const kolhapurStats = getDistrictStats('Kolhapur');
  const sangliStats = getDistrictStats('Sangli');
  const sataraStats = getDistrictStats('Satara');

  // Filter and search
  const filteredItems = masterItems.filter((item) => {
    const sName = item.participatingSchool.school_name.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const regId = item.registration?.school.registration_id?.toLowerCase() || '';

    const matchesSearch = !query || sName.includes(query) || regId.includes(query);
    const matchesDistrict = districtFilter === 'all' || item.participatingSchool.district === districtFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Participating Schools Master Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking all 36 accredited schools across Kolhapur, Sangli, and Satara districts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
            onClick={loadData}
          >
            Refresh Records
          </Button>
          <Link to="/admin/reports">
            <Button size="sm" variant="navy" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export Master Roster (.CSV)
            </Button>
          </Link>
        </div>
      </div>

      {/* 7 Required Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* 1. Total Participating Schools */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Schools</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalParticipatingSchools}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Official Roster</p>
        </div>

        {/* 2. Schools Registered */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{fullyRegisteredSchools}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Submitted / Active</p>
        </div>

        {/* 3. Not Yet Registered */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Not Registered</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{notYetRegisteredSchools}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting submission</p>
        </div>

        {/* 4. Total Students Registered */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">4 per school</p>
        </div>

        {/* 5. Total Mentors Registered */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Mentors</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalMentors}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">1 per school</p>
        </div>

        {/* 6. Pending Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-orange-600">{pendingApprovals}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Requires audit</p>
        </div>

        {/* 7. Approved Registrations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{approvedRegistrations}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Passes accredited</p>
        </div>
      </div>

      {/* District-Wise Statistics Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            District-Wise Registration Statistics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time participation progress across the three official districts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Kolhapur */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Kolhapur District</span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {kolhapurStats.percentage}% Complete
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Total</span>
                <span className="font-black text-slate-800 text-base">{kolhapurStats.total}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-emerald-600 block font-semibold">Registered</span>
                <span className="font-black text-emerald-600 text-base">{kolhapurStats.registered}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-amber-600 block font-semibold">Remaining</span>
                <span className="font-black text-amber-600 text-base">{kolhapurStats.remaining}</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${kolhapurStats.percentage}%` }}
              />
            </div>
          </div>

          {/* Sangli */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Sangli District</span>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {sangliStats.percentage}% Complete
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Total</span>
                <span className="font-black text-slate-800 text-base">{sangliStats.total}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-emerald-600 block font-semibold">Registered</span>
                <span className="font-black text-emerald-600 text-base">{sangliStats.registered}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-amber-600 block font-semibold">Remaining</span>
                <span className="font-black text-amber-600 text-base">{sangliStats.remaining}</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${sangliStats.percentage}%` }}
              />
            </div>
          </div>

          {/* Satara */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Satara District</span>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {sataraStats.percentage}% Complete
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Total</span>
                <span className="font-black text-slate-800 text-base">{sataraStats.total}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-emerald-600 block font-semibold">Registered</span>
                <span className="font-black text-emerald-600 text-base">{sataraStats.registered}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-amber-600 block font-semibold">Remaining</span>
                <span className="font-black text-amber-600 text-base">{sataraStats.remaining}</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${sataraStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All 34 Participating Schools Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search school name or Registration ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* District Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Districts (36 Schools)</option>
                <option value="Kolhapur">Kolhapur (16 Schools)</option>
                <option value="Sangli">Sangli (12 Schools)</option>
                <option value="Satara">Satara (8 Schools)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Statuses ({masterItems.length})</option>
                <option value="not_registered">Not Registered ({masterItems.filter(i => i.status === 'not_registered').length})</option>
                <option value="draft">Draft ({masterItems.filter(i => i.status === 'draft').length})</option>
                <option value="submitted">Submitted ({masterItems.filter(i => i.status === 'submitted').length})</option>
                <option value="under_review">Under Review ({masterItems.filter(i => i.status === 'under_review').length})</option>
                <option value="approved">Approved ({approvedRegistrations})</option>
                <option value="correction_required">Correction Required ({masterItems.filter(i => i.status === 'correction_required').length})</option>
                <option value="rejected">Rejected ({masterItems.filter(i => i.status === 'rejected').length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">School Name</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Registration Status</th>
                <th className="px-4 py-3">Mentor Name</th>
                <th className="px-4 py-3">Students Registered</th>
                <th className="px-4 py-3">Registration Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-xs">
                    No schools matched your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const ps = item.participatingSchool;
                  const reg = item.registration;
                  const s = reg?.school;
                  const m = reg?.mentor;
                  const stuCount = reg?.students?.filter(st => st.full_name)?.length || 0;
                  const dateStr = s?.submitted_at 
                    ? new Date(s.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : s?.created_at
                    ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '—';

                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr 
                      key={ps.id} 
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (s?.id) {
                          navigate(`/admin/school/${s.id}`);
                        } else {
                          // Unregistered school: open empty state view
                          navigate(`/admin/school/master-${ps.id}`);
                        }
                      }}
                    >
                      <td className="px-4 py-3.5 font-mono text-slate-400 font-semibold">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 min-w-[260px]">
                        <div className="flex items-center gap-2">
                          <SchoolIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="group-hover:text-blue-600 transition-colors">{ps.school_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ps.district === 'Kolhapur' ? 'bg-blue-50 text-blue-700' :
                          ps.district === 'Sangli' ? 'bg-indigo-50 text-indigo-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {ps.district}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.status === 'not_registered' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Not Registered
                          </span>
                        ) : (
                          <Badge status={item.status} />
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                        {m?.full_name || '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stuCount === 4 ? 'bg-emerald-50 text-emerald-700' :
                          stuCount > 0 ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {stuCount}/4 Students
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (s?.id) {
                              navigate(`/admin/school/${s.id}`);
                            } else {
                              navigate(`/admin/school/master-${ps.id}`);
                            }
                          }}
                        >
                          {reg ? 'Review' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} schools
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-mono text-slate-800 font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
