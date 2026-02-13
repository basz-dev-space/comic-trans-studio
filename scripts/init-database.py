#!/usr/bin/env python3
"""
Initialize Prisma database for Comic Translation Studio

This script:
1. Generates the Prisma Client
2. Creates the SQLite database
3. Runs migrations to set up all tables
"""

import subprocess
import sys
import os

# Change to project root directory (parent of scripts folder)
script_dir = os.getcwd()
if os.path.basename(script_dir) == "scripts":
    project_root = os.path.dirname(script_dir)
else:
    project_root = script_dir

os.chdir(project_root)

print("🔧 Initializing Comic Translation Studio Database...")
print("")

try:
    # Step 1: Generate Prisma Client
    print("📦 Generating Prisma Client...")
    result = subprocess.run(
        ["npx", "prisma", "generate"],
        capture_output=False,
        text=True,
        check=True
    )
    print("✅ Prisma Client generated successfully")
    print("")

    # Step 2: Check if database exists
    db_path = os.path.join(project_root, "prisma", "dev.db")
    db_exists = os.path.exists(db_path)
    
    if db_exists:
        print("📊 Database file exists at prisma/dev.db")
        print("🔄 Running migrations to ensure schema is up to date...")
    else:
        print("🆕 Creating new database at prisma/dev.db...")

    # Step 3: Push database schema (creates tables)
    result = subprocess.run(
        ["npx", "prisma", "db", "push", "--skip-generate"],
        capture_output=False,
        text=True,
        check=True
    )
    
    print("")
    print("✅ Database initialized successfully!")
    print("")
    print("📋 Summary:")
    print("   - Prisma Client: Generated")
    print("   - Database: Ready")
    print("   - Tables: Created")
    print("")
    print("🚀 You can now start the application!")
    print("")

except subprocess.CalledProcessError as e:
    print("")
    print(f"❌ Error initializing database: {e}")
    sys.exit(1)
except Exception as e:
    print("")
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
