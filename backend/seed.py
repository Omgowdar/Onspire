from datetime import datetime, timedelta, timezone
from database import SessionLocal, Base, engine
from models import Job
from fairness import check_fairness

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clear existing jobs to make seed idempotent
        print("Clearing existing jobs from database...")
        db.query(Job).delete()
        db.commit()
        
        # Base reference time is naive UTC now
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        print(f"Current UTC time baseline: {now}")
        
        # Sample jobs data (platform, distance_km, duration_minutes, fare, offset_from_now)
        # Mix of fair and underpaid across Uber, Zomato, Swiggy, and Ola
        jobs_data = [
            # --- Current Week Jobs (Last 7 days: T-6 to T) ---
            {
                "platform": "Uber",
                "distance_km": 12.5,
                "duration_minutes": 32,
                "fare": 160.0,  # Expected: 20 + 12.5*8 + 32*1 = 152. Fair.
                "timestamp": now - timedelta(hours=3)
            },
            {
                "platform": "Zomato",
                "distance_km": 4.2,
                "duration_minutes": 18,
                "fare": 50.0,   # Expected: 20 + 4.2*8 + 18*1 = 71.6. Underpaid (< 60.86).
                "timestamp": now - timedelta(days=1, hours=2)
            },
            {
                "platform": "Uber",
                "distance_km": 18.0,
                "duration_minutes": 45,
                "fare": 150.0,  # Expected: 20 + 18*8 + 45*1 = 209. Underpaid (< 177.65).
                "timestamp": now - timedelta(days=2, hours=10) # 10 PM
            },
            {
                "platform": "Swiggy",
                "distance_km": 2.5,
                "duration_minutes": 12,
                "fare": 55.0,   # Expected: 20 + 2.5*8 + 12*1 = 52. Fair.
                "timestamp": now - timedelta(days=3, hours=4)
            },
            {
                "platform": "Ola",
                "distance_km": 10.0,
                "duration_minutes": 25,
                "fare": 115.0,  # Expected: 20 + 10*8 + 25*1 = 125. Fair.
                "timestamp": now - timedelta(days=4, hours=6)
            },
            {
                "platform": "Zomato",
                "distance_km": 6.8,
                "duration_minutes": 28,
                "fare": 75.0,   # Expected: 20 + 6.8*8 + 28*1 = 102.4. Underpaid (< 87.04).
                "timestamp": now - timedelta(days=5, hours=22) # Night
            },
            {
                "platform": "Uber",
                "distance_km": 8.5,
                "duration_minutes": 22,
                "fare": 110.0,  # Expected: 20 + 8.5*8 + 22*1 = 110. Fair.
                "timestamp": now - timedelta(days=6, hours=1)
            },
            
            # --- Prior Week Jobs (Days T-13 to T-7) ---
            {
                "platform": "Uber",
                "distance_km": 15.0,
                "duration_minutes": 35,
                "fare": 180.0,  # Expected: 20 + 15*8 + 35*1 = 175. Fair.
                "timestamp": now - timedelta(days=8, hours=5)
            },
            {
                "platform": "Zomato",
                "distance_km": 5.0,
                "duration_minutes": 22,
                "fare": 60.0,   # Expected: 20 + 5*8 + 22*1 = 82. Underpaid (< 69.7).
                "timestamp": now - timedelta(days=9, hours=8)
            },
            {
                "platform": "Ola",
                "distance_km": 11.2,
                "duration_minutes": 28,
                "fare": 140.0,  # Expected: 20 + 11.2*8 + 28*1 = 137.6. Fair.
                "timestamp": now - timedelta(days=11, hours=3)
            },
            {
                "platform": "Swiggy",
                "distance_km": 3.0,
                "duration_minutes": 15,
                "fare": 40.0,   # Expected: 20 + 3*8 + 15*1 = 59. Underpaid (< 50.15).
                "timestamp": now - timedelta(days=12, hours=14)
            }
        ]
        
        for item in jobs_data:
            # Run fairness calculation dynamically
            fairness_info = check_fairness(item["fare"], item["distance_km"], item["duration_minutes"])
            
            job = Job(
                platform=item["platform"],
                fare=item["fare"],
                distance_km=item["distance_km"],
                duration_minutes=item["duration_minutes"],
                timestamp=item["timestamp"],
                flagged=fairness_info["flagged"],
                expected_fare=fairness_info["expected_fare"],
                underpayment_pct=fairness_info["underpayment_pct"]
            )
            db.add(job)
            
        db.commit()
        print(f"Successfully seeded {len(jobs_data)} sample jobs.")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
