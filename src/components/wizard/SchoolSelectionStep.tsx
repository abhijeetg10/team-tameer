import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  School as SchoolIcon,
  X
} from 'lucide-react';
import { District, ParticipatingSchool, School, RegistrationStatus } from '../../types';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SchoolSelectionStepProps {
  school: Partial<School>;
  currentUserId: string;
  onSelectSchool: (selected: {
    participating_school_id: string;
    school_name: string;
    district: District;
    address?: string;
    city?: string;
    principal_name?: string;
    school_email?: string;
    contact_number?: string;
    school_code?: string;
    logo_path?: string;
  }) => void;
  onProceed: () => void;
  disabled?: boolean;
}

export const SchoolSelectionStep: React.FC<SchoolSelectionStepProps> = ({
  school,
  currentUserId,
  onSelectSchool,
  onProceed,
  disabled = false,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | ''>(
    (school.district as District) || ''
  );
  const [schoolsInDistrict, setSchoolsInDistrict] = useState<ParticipatingSchool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSchool, setActiveSchool] = useState<ParticipatingSchool | null>(null);
  
  // Claim Status State
  const [claimStatus, setClaimStatus] = useState<{
    isClaimed: boolean;
    isClaimedByCurrentUser: boolean;
    registrationId?: string;
    status?: RegistrationStatus;
  } | null>(null);
  const [isCheckingClaim, setIsCheckingClaim] = useState(false);

  // Representative Verification Confirmation
  const [confirmedAuth, setConfirmedAuth] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load schools when district changes
  useEffect(() => {
    if (selectedDistrict) {
      api.getParticipatingSchools(selectedDistrict as District).then((list) => {
        setSchoolsInDistrict(list);
      });
    } else {
      setSchoolsInDistrict([]);
    }
  }, [selectedDistrict]);

  // If school already has a participating_school_id, load its object
  useEffect(() => {
    if (school.participating_school_id) {
      api.getParticipatingSchoolById(school.participating_school_id).then((ps) => {
        if (ps) {
          setActiveSchool(ps);
          setSelectedDistrict(ps.district);
          checkClaim(ps.id);
        }
      });
    }
  }, [school.participating_school_id]);

  // Click outside listener for searchable dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkClaim = async (participatingSchoolId: string) => {
    setIsCheckingClaim(true);
    try {
      const res = await api.checkSchoolClaimStatus(participatingSchoolId, currentUserId);
      setClaimStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingClaim(false);
    }
  };

  const handleDistrictChange = (district: District | '') => {
    setSelectedDistrict(district);
    setActiveSchool(null);
    setSearchQuery('');
    setClaimStatus(null);
    setIsDropdownOpen(false);
  };

  const handleSchoolSelect = async (ps: ParticipatingSchool) => {
    setActiveSchool(ps);
    setSearchQuery('');
    setIsDropdownOpen(false);
    await checkClaim(ps.id);

    onSelectSchool({
      participating_school_id: ps.id,
      school_name: ps.school_name,
      district: ps.district,
      city: `${ps.district} District`,
      address: school.address || '',
      principal_name: school.principal_name || '',
      school_email: school.school_email || '',
      contact_number: school.contact_number || '',
    });
  };

  // Filter schools in district by search query
  const filteredSchools = schoolsInDistrict.filter((s) =>
    s.school_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const isAlreadyClaimedByOther = Boolean(
    claimStatus?.isClaimed && !claimStatus.isClaimedByCurrentUser
  );

  const canContinue = Boolean(
    activeSchool &&
    !isAlreadyClaimedByOther &&
    school.principal_name?.trim() &&
    school.school_email?.trim() &&
    school.contact_number?.trim() &&
    school.address?.trim() &&
    confirmedAuth
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Title & Guidance */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Select Your School
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Choose your district and school to begin your event registration from the 34 officially accredited institutions.
        </p>
      </div>

      {/* District & School Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* District Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Select District <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              disabled={disabled}
              onChange={(e) => handleDistrictChange(e.target.value as District | '')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 transition-colors"
            >
              <option value="">-- Choose District --</option>
              <option value="Kolhapur">Kolhapur (16 Participating Schools)</option>
              <option value="Sangli">Sangli (12 Participating Schools)</option>
              <option value="Satara">Satara (6 Participating Schools)</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500">
            Official event covers 34 institutions across Kolhapur, Sangli, and Satara.
          </p>
        </div>

        {/* Searchable School Dropdown */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Select Participating School <span className="text-rose-500">*</span>
          </label>

          <div
            onClick={() => {
              if (selectedDistrict && !disabled) setIsDropdownOpen(true);
            }}
            className={`w-full min-h-[42px] px-3.5 py-2 rounded-xl border flex items-center justify-between text-sm transition-all cursor-pointer ${
              !selectedDistrict
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                : isDropdownOpen
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
                : 'border-slate-300 bg-white hover:border-slate-400 text-slate-900'
            }`}
          >
            <span className={`truncate font-medium ${activeSchool ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
              {activeSchool
                ? activeSchool.school_name
                : selectedDistrict
                ? `Search among ${schoolsInDistrict.length} schools in ${selectedDistrict}...`
                : 'Select a district first'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </div>

          {/* Search Dropdown Popover */}
          {isDropdownOpen && selectedDistrict && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Search Input */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder={`Type school name (e.g. Jawahar, Anglo, Azad)...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* School List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                {filteredSchools.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No schools in <strong>{selectedDistrict}</strong> match "{searchQuery}".
                    <p className="text-[10px] text-slate-400 mt-1">
                      Only officially accredited schools from the event dataset may be selected.
                    </p>
                  </div>
                ) : (
                  filteredSchools.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSchoolSelect(item)}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-blue-50/80 transition-colors flex items-start gap-2.5 ${
                        activeSchool?.id === item.id ? 'bg-blue-50/90 font-semibold text-blue-700' : 'text-slate-800'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{item.school_name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected School Confirmation Card */}
      {activeSchool && (
        <div className={`p-5 rounded-xl border transition-all space-y-4 ${
          isAlreadyClaimedByOther 
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : 'bg-blue-50/40 border-blue-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <SchoolIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Selected Institution
                </p>
                <h4 className="text-sm font-bold text-slate-900">
                  {activeSchool.school_name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                District: <strong>{activeSchool.district}</strong>
              </span>

              {isCheckingClaim ? (
                <span className="text-xs text-slate-400">Verifying availability...</span>
              ) : isAlreadyClaimedByOther ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Already Registered ({claimStatus?.registrationId || 'Active'})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Available for Registration
                </span>
              )}
            </div>
          </div>

          {/* Duplicate Claim Warning */}
          {isAlreadyClaimedByOther && (
            <div className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Registration Slot Already Occupied:</strong>
                This school has already been claimed or submitted under Registration ID <strong>{claimStatus?.registrationId}</strong> (Status: {claimStatus?.status?.toUpperCase()}). To prevent duplicate entries, please choose your own institution or contact the event secretariat.
              </div>
            </div>
          )}

          {/* School Leadership & Contact Fields (Associated with the chosen school) */}
          {!isAlreadyClaimedByOther && (
            <div className="space-y-4 pt-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Authorized School Credentials & Principal Desk:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Principal's Full Name"
                  placeholder="e.g. Dr. A. R. Khan"
                  required
                  value={school.principal_name || ''}
                  onChange={(e) => onSelectSchool({
                    participating_school_id: activeSchool.id,
                    school_name: activeSchool.school_name,
                    district: activeSchool.district,
                    principal_name: e.target.value,
                  })}
                />

                <Input
                  label="Official School Email"
                  type="email"
                  placeholder="e.g. principal@school.edu"
                  required
                  value={school.school_email || ''}
                  onChange={(e) => onSelectSchool({
                    participating_school_id: activeSchool.id,
                    school_name: activeSchool.school_name,
                    district: activeSchool.district,
                    school_email: e.target.value,
                  })}
                />

                <Input
                  label="School Contact Telephone"
                  placeholder="e.g. +91 233 222 3456"
                  required
                  value={school.contact_number || ''}
                  onChange={(e) => onSelectSchool({
                    participating_school_id: activeSchool.id,
                    school_name: activeSchool.school_name,
                    district: activeSchool.district,
                    contact_number: e.target.value,
                  })}
                />

                <Input
                  label="UDISE ID / School Affiliation Code"
                  placeholder="e.g. 27350600102 (Optional)"
                  value={school.school_code || ''}
                  onChange={(e) => onSelectSchool({
                    participating_school_id: activeSchool.id,
                    school_name: activeSchool.school_name,
                    district: activeSchool.district,
                    school_code: e.target.value,
                  })}
                />

                <div className="sm:col-span-2">
                  <Input
                    label="School Physical Postal Address"
                    placeholder="e.g. Station Road, Miraj"
                    required
                    value={school.address || ''}
                    onChange={(e) => onSelectSchool({
                      participating_school_id: activeSchool.id,
                      school_name: activeSchool.school_name,
                      district: activeSchool.district,
                      address: e.target.value,
                    })}
                  />
                </div>
              </div>

              {/* Secure School-Claim Verification Checkbox */}
              <div className="p-3.5 bg-white rounded-xl border border-blue-200/80 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedAuth}
                    onChange={(e) => setConfirmedAuth(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs text-slate-700 leading-normal">
                    <span className="font-bold text-slate-900 block mb-0.5">
                      Institutional Representative Authorization Declaration:
                    </span>
                    I solemnly verify that I am the bonafide Principal or officially authorized representative appointed by <strong>{activeSchool.school_name}</strong> to manage this event registration. I understand this claim is subject to administrator verification before final accreditation passes are released.
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {!activeSchool
            ? 'Select district and school to continue'
            : isAlreadyClaimedByOther
            ? 'Cannot proceed with already registered school'
            : canContinue
            ? '✓ Selection and credentials complete'
            : 'Fill in principal details and confirm authorization to proceed'}
        </span>

        <Button
          size="md"
          variant="primary"
          disabled={!canContinue}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={onProceed}
        >
          Confirm & Continue to Mentor Details
        </Button>
      </div>
    </div>
  );
};
