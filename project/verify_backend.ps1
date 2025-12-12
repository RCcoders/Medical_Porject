$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8000"

# 1. Register
$email = "test_auto_$(Get-Random)@example.com"
$password = "password123"
try {
    $regBody = @{
        email = $email
        password = $password
        full_name = "Test User"
        role = "patient"
        phone = "1234567890"
        date_of_birth = "1990-01-01"
    } | ConvertTo-Json
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "Registered user: $email"
} catch {
    Write-Host "Registration failed or user exists (ignoring): $_"
}

# 2. Login
$loginBody = "username=$email&password=$password"
$tokenResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/x-www-form-urlencoded"
$token = $tokenResponse.access_token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Logged in. Token obtained."

# 3. Create Appointment
$apptBody = @{
    doctor_name = "Dr. Smith"
    specialty = "Cardiology"
    hospital_clinic = "City Hospital"
    appointment_date = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
    appointment_type = "Routine"
    reason = "Checkup"
    status = "Scheduled"
    notes = "Test Note"
} | ConvertTo-Json

$apptResponse = Invoke-RestMethod -Uri "$baseUrl/patient-data/appointments" -Method Post -Body $apptBody -ContentType "application/json" -Headers $headers
$apptId = $apptResponse.id
Write-Host "Created Appointment ID: $apptId"

# 4. Update Status to Completed
$statusBody = @{ status = "Completed" } | ConvertTo-Json
$updateResponse = Invoke-RestMethod -Uri "$baseUrl/patient-data/appointments/$apptId/status" -Method Put -Body $statusBody -ContentType "application/json" -Headers $headers
Write-Host "Updated Appointment Status to Completed"

# 5. Check Hospital Visits
$visitsResponse = Invoke-RestMethod -Uri "$baseUrl/patient-data/visits" -Method Get -Headers $headers
$foundVisit = $visitsResponse | Where-Object { $_.hospital_name -eq "City Hospital" -and $_.primary_doctor -eq "Dr. Smith" }

if ($foundVisit) {
    Write-Host "SUCCESS: Automated Hospital Visit found!"
    Write-Host "Visit ID: $($foundVisit.id)"
} else {
    Write-Host "FAILURE: Hospital Visit not found."
    exit 1
}
