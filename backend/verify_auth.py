import requests
import uuid

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Register
    email = f"test_{uuid.uuid4()}@example.com"
    password = "password123"
    user_data = {
        "email": email,
        "password": password,
        "full_name": "Test User",
        "role": "doctor"
    }
    
    print(f"Registering user: {email}")
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"Registration failed: {response.text}")
        return
    
    user_id = response.json()["id"]
    print(f"User registered with ID: {user_id}")
    
    # 2. Login
    print("Logging in...")
    login_data = {
        "username": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    print("Login successful, token received.")
    
    # 3. Get Me
    print("Fetching current user...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    if response.status_code != 200:
        print(f"Get Me failed: {response.text}")
        return
    
    print(f"Current user: {response.json()['email']}")
    
    # 4. Create Doctor Profile
    print("Creating doctor profile...")
    doctor_data = {
        "specialty": "Cardiology",
        "license_number": "DOC12345",
        "years_of_experience": 10,
        "hospital_affiliation": "General Hospital",
        "bio": "Experienced cardiologist."
    }
    # Note: In real app, user_id comes from token, but my create_doctor endpoint currently takes user_id as query param for simplicity in crud/router.
    # Wait, I implemented create_doctor in router to take user_id as query param.
    # Let's check router implementation.
    # @router.post("/", response_model=schemas.Doctor)
    # def create_doctor(doctor: schemas.DoctorCreate, user_id: str, db: Session = Depends(get_db)):
    
    response = requests.post(f"{BASE_URL}/doctors/?user_id={user_id}", json=doctor_data, headers=headers)
    if response.status_code != 200:
        print(f"Create Doctor failed: {response.text}")
        return
        
    print("Doctor profile created.")
    
    # 5. List Doctors
    print("Listing doctors...")
    response = requests.get(f"{BASE_URL}/doctors/", headers=headers)
    doctors = response.json()
    print(f"Doctors found: {len(doctors)}")
    
    print("Verification Successful!")

if __name__ == "__main__":
    test_auth_flow()
