create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text,
  persona text not null,
  profile jsonb not null default '{}',
  email_verified boolean not null default false,
  google_id text,
  xp integer not null default 0,
  streak integer not null default 0,
  level text not null default 'Beginner',
  created_at timestamptz not null default now()
);

create table if not exists roadmap_nodes (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  parent_id text references roadmap_nodes(id) on delete cascade,
  title text not null,
  node_type text not null,
  status text not null,
  estimated_hours numeric not null default 0,
  progress integer not null default 0,
  next_revision date,
  sort_order integer not null default 0
);

create table if not exists study_tasks (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  category text not null,
  priority text not null,
  status text not null,
  due_date date not null,
  estimated_minutes integer not null,
  sort_order integer not null default 0
);

create table if not exists study_sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  mode text not null,
  focus_minutes integer not null,
  break_minutes integer not null,
  subject text not null,
  completed_at timestamptz not null default now()
);

create table if not exists mock_scores (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  label text not null,
  score integer not null,
  total integer not null,
  taken_at timestamptz not null default now()
);

create table if not exists study_notes (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  note_type text not null,
  subject text not null,
  body text not null,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
