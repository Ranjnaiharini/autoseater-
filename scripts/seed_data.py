#!/usr/bin/env python3
"""
Seed script to populate the database with demo data for AutoSeater+
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "autoseater_db"

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Starting database seeding...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.departments.delete_many({})
    await db.rooms.delete_many({})
    await db.students.delete_many({})
    await db.exams.delete_many({})
    await db.seating_plans.delete_many({})
    print("✓ Cleared existing data")
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin_data = {
        "id": admin_id,
        "username": "admin",
        "email": "admin@autoseater.com",
        "password": pwd_context.hash("admin123"),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_data)
    print("✓ Created admin user (username: admin, password: admin123)")
    
    # Create invigilator user
    invigilator_id = str(uuid.uuid4())
    invigilator_data = {
        "id": invigilator_id,
        "username": "invigilator",
        "email": "invigilator@autoseater.com",
        "password": pwd_context.hash("invigi123"),
        "role": "invigilator",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(invigilator_data)
    print("✓ Created invigilator user (username: invigilator, password: invigi123)")
    
    # Create departments
    departments = [
        {
            "id": str(uuid.uuid4()),
            "name": "Computer Science Engineering",
            "code": "CSE",
            "subjects": ["English", "DBMS", "Data Structures", "Algorithms", "Operating Systems"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Information Technology",
            "code": "IT",
            "subjects": ["English", "Networks", "Web Development", "Cloud Computing", "DBMS"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Electronics & Communication",
            "code": "ECE",
            "subjects": ["English", "Digital Electronics", "Signal Processing", "Communications"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Artificial Intelligence & Data Science",
            "code": "AIDS",
            "subjects": ["English", "Machine Learning", "Deep Learning", "Data Mining", "AI"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.departments.insert_many(departments)
    print(f"✓ Created {len(departments)} departments")
    
    # Create rooms
    rooms = [
        {
            "id": str(uuid.uuid4()),
            "name": "Room 101",
            "capacity": 60,
            "desk_count": 30,
            "rows": 5,
            "columns": 6,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Room 102",
            "capacity": 50,
            "desk_count": 25,
            "rows": 5,
            "columns": 5,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Room 201",
            "capacity": 80,
            "desk_count": 40,
            "rows": 5,
            "columns": 8,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Auditorium",
            "capacity": 120,
            "desk_count": 60,
            "rows": 6,
            "columns": 10,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.rooms.insert_many(rooms)
    print(f"✓ Created {len(rooms)} rooms")
    
    # Create students
    students = []
    departments_list = ["CSE", "IT", "ECE", "AIDS"]
    subjects_map = {
        "CSE": ["English", "DBMS", "Data Structures", "Algorithms"],
        "IT": ["English", "Networks", "Web Development", "DBMS"],
        "ECE": ["English", "Digital Electronics", "Signal Processing"],
        "AIDS": ["English", "Machine Learning", "Deep Learning", "AI"]
    }
    
    names = [
        "Arjun Kumar", "Priya Sharma", "Rahul Singh", "Sneha Patel", "Vikram Reddy",
        "Ananya Iyer", "Karthik Nair", "Divya Menon", "Siddharth Roy", "Meera Joshi",
        "Aditya Verma", "Riya Gupta", "Rohan Das", "Pooja Pillai", "Amit Shah",
        "Kavya Krishnan", "Varun Bhat", "Neha Desai", "Rajesh Kumar", "Sakshi Agarwal",
        "Harish Rao", "Shreya Sinha", "Manoj Pandey", "Anjali Mishra", "Naveen Kapoor",
        "Swathi Reddy", "Deepak Jain", "Shruti Malhotra", "Vishal Chopra", "Kritika Saxena"
    ]
    
    roll_num = 1
    for dept in departments_list:
        for i in range(25):  # 25 students per department
            name_idx = (roll_num - 1) % len(names)
            student = {
                "id": str(uuid.uuid4()),
                "roll_number": f"23B{dept}{roll_num:03d}",
                "name": names[name_idx],
                "department": dept,
                "subjects": subjects_map[dept],
                "email": f"student{roll_num}@college.edu",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            students.append(student)
            roll_num += 1
    
    await db.students.insert_many(students)
    print(f"✓ Created {len(students)} students")
    
    print("\n" + "="*50)
    print("Database seeded successfully!")
    print("="*50)
    print("\nLogin Credentials:")
    print("  Admin: username=admin, password=admin123")
    print("  Invigilator: username=invigilator, password=invigi123")
    print(f"\nCreated:")
    print(f"  - {len(departments)} departments")
    print(f"  - {len(rooms)} rooms")
    print(f"  - {len(students)} students")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
