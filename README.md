# School Event Registration & Administration Platform (EVT-2026)

A production-quality, secure web application for managing the **34 officially accredited participating schools** across **Kolhapur, Sangli, and Satara** districts. Teams consist of **exactly 4 students and 1 designated faculty mentor per school**, backed by Google authentication, predefined school claim verification, UIDAI minor privacy safeguards, digital PDF acknowledgement passes, and a centralized administrator review console.

---

## 1. Official Participating Schools Dataset (34 Schools)

### District: Kolhapur (16 Schools)
1. Urdu High School Chandgadh
2. Dr. Zakir Husain Anglo Urdu High School & Jr. College Aajra
3. Urdu High School Halkarni
4. Maulana Azad High School and Jr College Kolhapur
5. Nehru High School and Jr. College Kolhapur
6. Urdu Anglo High School Shiroli
7. Urdu High School Vikram Nagar Ichalkaranji
8. National High School & Jr. College Ichalkaranji
9. Urdu High School Rui
10. Urdu High School Rajapur
11. Anglo Urdu High School Aurwad
12. Ishaatul Uloom Urdu High School Alas
13. Dr. Allama Iqbal High School and Jr. College Kurundwad
14. Urdu High School Shirol
15. Anglo Urdu High School and Jr College Jaysingpur
16. Urdu High School and Jr College Rendal

### District: Sangli (12 Schools)
1. Mohammadiya Anglo Urdu School & Jr College Sangli
2. Jawahar Urdu High School & Jr College Miraj
3. Shamnamira Girls High School & Jr College Miraj
4. Anglo Urdu High School Ashta
5. Dr. Zakir Hussain High School Palus
6. Noor Girls High School Sangli
7. Rehmat Anglo Urdu School Vita
8. Anjuman Urdu High School Jath
9. Moulana Abulkalam Nivasi Shala Rampur
10. Hazrat Mohabat Suleman High School Islampur
11. Chand Urdu School Miraj
12. Dr. Salim Urdu High School Miraj

### District: Satara (6 Schools)
1. Husen Kasam Danekari Anglo Urdu Highschool Karad
2. Anjuman Khairul Islam Urdu High School Satara
3. Shaheen High School Karad
4. Satara Urdu Highschool & Junior College Nagthane
5. Haji Abdul Rajjak Urdu Highschool And Junior College Phaltan
6. Madrasa Islamiya Ziya Ul Quran Malkapur

---

## 2. Updated Registration Workflow

### Step 1: Google Authentication
* Principal, mentor, or authorized representative signs in with Google OAuth.
* If a returning representative already has an active registration, they are redirected directly to their school dashboard.
* New representatives are directed to **School Selection**.

### Step 2: District Selection
* Dropdown containing:
  1. `Kolhapur` (16 Schools)
  2. `Sangli` (12 Schools)
  3. `Satara` (6 Schools)

### Step 3: Searchable School Selection & Claim Verification
* School dropdown is disabled until a district is selected.
* As the user types, it performs case-insensitive matching against only schools in the chosen district.
* Displays a clear confirmation card with:
  * **District** (e.g., Sangli)
  * **School** (e.g., Jawahar Urdu High School & Jr College Miraj)
  * **Status**: "Available for Registration" or "Already Registered / Claimed"
* Prevents duplicate registrations: users cannot register a school that has already been claimed.
* Includes an institutional representative authorization declaration.

### Step 4: Mentor Details
* Full Name, Mobile Contact, Faculty ID scan, and Passport Photograph.

### Step 5: 4 Student Delegates
* Exactly 4 student delegates numbered 1 to 4.
* Full Name, Class / Grade, Passport Photograph, School ID card, and secondary ID proof.
* **UIDAI Aadhaar Privacy Standard**: Unmasked 12-digit Aadhaar cards are strictly prohibited; only masked copies (showing at most the last 4 digits) or School IDs are accepted.

### Step 6: Review, Autosave & PDF Acknowledgement
* Complete review of selected school, district, mentor, and all 4 students.
* Submits with 4 mandatory legal declarations and confetti celebration.
* Generates a unique Registration ID (e.g., `EVT-2026-001`) and provides a downloadable **Official Acknowledgement PDF**.

---

## 3. Updated Administrator Console

* **7 Real-Time Metric Cards:**
  1. Total Participating Schools: 34
  2. Schools Registered (Dynamic count of submitted/active registrations)
  3. Schools Not Yet Registered (34 minus registered)
  4. Total Students Registered (Dynamic count)
  5. Total Mentors Registered (Dynamic count)
  6. Pending Approvals (Dynamic count)
  7. Approved Registrations (Dynamic count)
* **District-Wise Progress Section:**
  * Kolhapur (16 Total, Registered, Remaining, Progress Bar)
  * Sangli (12 Total, Registered, Remaining, Progress Bar)
  * Satara (6 Total, Registered, Remaining, Progress Bar)
* **All 34 Schools Directory Table:**
  * Shows all 34 schools regardless of registration status (`Not Registered`, `Draft`, `Submitted`, `Under Review`, `Approved`, `Correction Required`, `Rejected`).
  * Filter by District and Registration Status, or search by school name.
* **Dedicated Review Dossier:**
  * Detailed school view with mentor and 4-student cards.
  * Secure document preview modal (zoom/rotate/watermark).
  * Actions: **Verify Representative**, **Approve**, **Request Correction**, **Reject**.
  * Unregistered schools display a clean "Registration Not Received" empty state.

---

## 4. Database Schema (`supabase/migrations/20261014_init.sql`)

* `participating_schools`: Master table with `id (UUID PK)`, `school_name`, `district`, `is_active`, and idempotent seed for all 34 schools.
* `schools`: Foreign key `participating_school_id`, `district`, `registered_by_user_id`, `is_representative_verified`, and `UNIQUE(participating_school_id)` constraint to enforce single registration per school.
* PostgreSQL trigger `trg_validate_school_submission` to enforce exactly 1 mentor and 4 students at database transaction level.

---

## 5. Running Locally

```bash
# Start Vite development server
npm run dev

# Run production build validation
npm run build
```
Available at: `http://localhost:5173/`
