namespace backend.Controllers;

public static class DoctorAppointmentTimePolicy
{
    public static bool IsFutureOrCurrent(DateOnly appointmentDate, TimeOnly appointmentTime, DateTime now)
    {
        return appointmentDate.ToDateTime(appointmentTime) >= now;
    }

    public static bool HasStarted(DateOnly appointmentDate, TimeOnly appointmentTime, DateTime now)
    {
        return !IsFutureOrCurrent(appointmentDate, appointmentTime, now);
    }
}
