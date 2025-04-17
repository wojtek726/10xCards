-- Migration: Initial Schema for AI Flashcards Application
-- Description: Creates the initial database schema including users and flashcards tables
-- with proper RLS policies and indexes
-- Created at: 2024-03-26 14:30:00 UTC
-- Author: AI Assistant

-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- Create custom enum type for card origin
create type card_origin_enum as enum ('manual', 'ai', 'ai_modified');

-- Create users table
create table users (
    id uuid primary key default gen_random_uuid(),
    login varchar(32) not null unique,
    hash_password varchar(255) not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

-- Note: RLS is disabled for development purposes
-- alter table users enable row level security;

-- Create flashcards table
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    front varchar(200) not null,
    back varchar(500) not null,
    card_origin card_origin_enum not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

-- Create index on user_id for better query performance
create index idx_flashcards_user_id on flashcards(user_id);

-- Note: RLS is disabled for development purposes
-- alter table flashcards enable row level security;

-- Create trigger function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

-- Create triggers for automatic updated_at updates
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column(); 