-- ─── UMSEBENZI DATABASE TABLES ───────────────────────────────

-- Users table (all user types)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'client', 'company')),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  id_number VARCHAR(20) UNIQUE,
  gender VARCHAR(10),
  nationality VARCHAR(50),
  profile_photo VARCHAR(255),
  id_document_front VARCHAR(255),
  id_document_back VARCHAR(255),
  selfie_with_id VARCHAR(255),
  proof_of_residence VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_available BOOLEAN DEFAULT false,
  availability_date DATE,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  performance_score DECIMAL(3, 2) DEFAULT 5.00,
  rating_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'documents_review', 'fingerprints_required', 'fingerprints_done', 'approved', 'suspended', 'banned')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  payment_method_linked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Worker skills table
CREATE TABLE IF NOT EXISTS worker_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_category VARCHAR(100) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Worker qualifications table
CREATE TABLE IF NOT EXISTS qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  qualification_type VARCHAR(50) NOT NULL CHECK (qualification_type IN ('matric', 'certificate', 'diploma', 'degree', 'postgraduate', 'other')),
  institution_name VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  year_completed INTEGER,
  document_url VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) UNIQUE NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  company_type VARCHAR(50) NOT NULL,
  tax_number VARCHAR(50),
  vat_number VARCHAR(50),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  website VARCHAR(255),
  physical_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cipc_document VARCHAR(255),
  tax_clearance VARCHAR(255),
  letterhead VARCHAR(255),
  bank_name VARCHAR(100),
  account_holder VARCHAR(255),
  account_number VARCHAR(50),
  branch_code VARCHAR(20),
  rep_full_name VARCHAR(255),
  rep_id_number VARCHAR(20),
  rep_role VARCHAR(100),
  rep_phone VARCHAR(20),
  rep_email VARCHAR(100),
  is_premium BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('instant', 'scheduled', 'project')),
  duration_type VARCHAR(20) CHECK (duration_type IN ('hourly', 'daily', 'weekly', 'fixed')),
  pay_amount DECIMAL(10, 2) NOT NULL,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  posted_by_type VARCHAR(20) CHECK (posted_by_type IN ('admin', 'company')),
  is_noticeboard BOOLEAN DEFAULT false,
  opening_date TIMESTAMP DEFAULT NOW(),
  deadline TIMESTAMP,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job requests table
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'disputed', 'cancelled')),
  needs_transport BOOLEAN DEFAULT false,
  transport_cost DECIMAL(10, 2) DEFAULT 0.00,
  transport_arranged BOOLEAN DEFAULT false,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  total_hours DECIMAL(5, 2),
  total_amount DECIMAL(10, 2),
  platform_commission DECIMAL(10, 2),
  worker_payout DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'escrowed', 'released', 'refunded')),
  digital_contract_signed_worker BOOLEAN DEFAULT false,
  digital_contract_signed_client BOOLEAN DEFAULT false,
  worker_confirmed_start BOOLEAN DEFAULT false,
  client_confirmed_start BOOLEAN DEFAULT false,
  worker_confirmed_end BOOLEAN DEFAULT false,
  client_confirmed_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'system')),
  content TEXT,
  voice_url VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES users(id) ON DELETE CASCADE,
  rated_user UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_