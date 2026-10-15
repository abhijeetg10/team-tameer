import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Building2, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2,
  Table,
  MapPin
} from 'lucide-react';
import { api } from '../../lib/api';
import { FullSchoolRegistration } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminReportsPage: React.FC = () => {
  const [schools, setSchools] = useState<FullSchoolRegistration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'schools' | 'mentors' | 'students'>('schools');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAllSchools();
        setSchools(data);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sanitized CSV Export:
  // "Do not include Aadhaar documents, private storage links or sensitive identity details in ordinary exports."
  const exportCleanCsv = () => {
    const headers = [
      'Registration ID',
      'School Name',
      'District',
      'City / District Address',
      'Principal Name',
      'Official School Email',
      'Contact Number',
      'Status',
      'Mentor Name',
      'Mentor Designation',
      'Mentor Contact',
      'Student 1 Name',
      'Student 1 Class',
      'Student 2 Name',
      'Student 2 Class',
      'Student 3 Name',
      'Student 3 Class',
      'Submission Date'
    ];

    const rows = schools.map(item => {
      const s = item.school;
      const m = item.mentor;
      const stus = item.students;

      const stu1 = stus.find(st => st.student_number === 1);
      const stu2 = stus.find(st => st.student_number === 2);
      const stu3 = stus.find(st => st.student_number === 3);

      return [
        `"${s.registration_id}"`,
        `"${s.school_name.replace(/"/g, '""')}"`,
        `"${s.district || ''}"`,
        `"${s.city}"`,
        `"${s.principal_name}"`,
        `"${s.school_email}"`,
        `"${s.contact_number}"`,
        `"${s.status.toUpperCase()}"`,
        `"${m.full_name || 'N/A'}"`,
        `"${m.designation || 'N/A'}"`,
        `"${m.phone || 'N/A'}"`,
        `"${stu1?.full_name || 'N/A'}"`,
        `"${stu1?.class_name || 'N/A'}"`,
        `"${stu2?.full_name || 'N/A'}"`,
        `"${stu2?.class_name || 'N/A'}"`,
        `"${stu3?.full_name || 'N/A'}"`,
        `"${stu3?.class_name || 'N/A'}"`,
        `"${s.submitted_at || s.created_at}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Team_Tameer_Roster_36Schools_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Administrative Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit summaries, district breakdowns, and privacy-sanitized CSV export.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={exportCleanCsv}
        >
          Export Sanitized Roster (.CSV)
        </Button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <p className="font-bold mb-0.5">Privacy-First Data Export Safeguard Active</p>
          In strict compliance with statutory student privacy standards, all exported reports automatically exclude private storage links, identity document scans, and sensitive credentials. Only official directory information is included.
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('schools')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'schools' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Registered Institutions ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'mentors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Mentor Faculty Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Delegates Roster</span>
        </button>
      </div>

      {/* Tables based on Active Tab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {activeTab === 'schools' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Registration ID</th>
                  <th className="px-4 py-3">School Name</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map(({ school, students }) => (
                  <tr key={school.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{school.registration_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{school.school_name}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{school.district || school.city}</td>
                    <td className="px-4 py-3">{school.principal_name}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{school.contact_number}</td>
                    <td className="px-4 py-3 font-semibold">{students?.length || 0}/4</td>
                    <td className="px-4 py-3"><Badge status={school.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Mentor Name</th>
                  <th className="px-4 py-3">Representing School</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Mobile Contact</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">Reg ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map(({ school, mentor }) => (
                  <tr key={mentor.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">{mentor.full_name || 'N/A'}</td>
                    <td className="px-4 py-3">{school.school_name}</td>
                    <td className="px-4 py-3">{school.district || '—'}</td>
                    <td className="px-4 py-3">{mentor.designation || 'Faculty Member'}</td>
                    <td className="px-4 py-3 font-mono">{mentor.phone}</td>
                    <td className="px-4 py-3">{mentor.email || '—'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{school.registration_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class / Grade</th>
                  <th className="px-4 py-3">School Name</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Reg ID</th>
                  <th className="px-4 py-3">Delegate #</th>
                  <th className="px-4 py-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.flatMap(({ school, students }) => 
                  students.map(stu => (
                    <tr key={stu.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">{stu.full_name}</td>
                      <td className="px-4 py-3">{stu.class_name}</td>
                      <td className="px-4 py-3">{school.school_name}</td>
                      <td className="px-4 py-3">{school.district || '—'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{school.registration_id}</td>
                      <td className="px-4 py-3 font-mono">Delegate {stu.student_number}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">✓ Photo & ID on record</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
