using backend.Controllers;

var fixedNow = new DateTime(2026, 5, 22, 10, 30, 0, DateTimeKind.Local);

AssertTrue(
    DoctorAppointmentTimePolicy.HasStarted(DateOnly.FromDateTime(fixedNow), new TimeOnly(10, 0), fixedNow),
    "allows prescriptions after an appointment starts");

AssertFalse(
    DoctorAppointmentTimePolicy.HasStarted(DateOnly.FromDateTime(fixedNow), new TimeOnly(11, 0), fixedNow),
    "rejects prescriptions before an appointment starts");

AssertFalse(
    DoctorAppointmentTimePolicy.IsFutureOrCurrent(DateOnly.FromDateTime(fixedNow), new TimeOnly(10, 0), fixedNow),
    "rejects referral appointments in the past");

AssertTrue(
    DoctorAppointmentTimePolicy.IsFutureOrCurrent(DateOnly.FromDateTime(fixedNow), new TimeOnly(11, 0), fixedNow),
    "allows referral appointments in the future");

Console.WriteLine("Doctor appointment time policy tests passed.");

static void AssertTrue(bool condition, string name)
{
    if (!condition) throw new Exception($"Expected true: {name}");
}

static void AssertFalse(bool condition, string name)
{
    if (condition) throw new Exception($"Expected false: {name}");
}
