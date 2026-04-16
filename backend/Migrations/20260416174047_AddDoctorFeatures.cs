using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "users",
                schema: "public",
                columns: table => new
                {
                    userid = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    fullname = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    passwordhash = table.Column<string>(type: "text", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    specialization = table.Column<string>(type: "text", nullable: true),
                    department = table.Column<string>(type: "text", nullable: true),
                    isavailable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.userid);
                });

            migrationBuilder.CreateTable(
                name: "appointments",
                schema: "public",
                columns: table => new
                {
                    appointmentid = table.Column<Guid>(type: "uuid", nullable: false),
                    patientid = table.Column<Guid>(type: "uuid", nullable: false),
                    doctorid = table.Column<Guid>(type: "uuid", nullable: false),
                    appointmentdate = table.Column<DateOnly>(type: "date", nullable: false),
                    appointmenttime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    doctornotes = table.Column<string>(type: "text", nullable: true),
                    prescription = table.Column<string>(type: "text", nullable: true),
                    notetype = table.Column<string>(type: "text", nullable: true),
                    notecontent = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointments", x => x.appointmentid);
                    table.ForeignKey(
                        name: "FK_appointments_users_doctorid",
                        column: x => x.doctorid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointments_users_patientid",
                        column: x => x.patientid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    patientid = table.Column<Guid>(type: "uuid", nullable: false),
                    filename = table.Column<string>(type: "text", nullable: false),
                    fileurl = table.Column<string>(type: "text", nullable: false),
                    documenttype = table.Column<string>(type: "text", nullable: false),
                    filesize = table.Column<string>(type: "text", nullable: false),
                    uploaddate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_documents_users_patientid",
                        column: x => x.patientid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "prescriptions",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointmentid = table.Column<Guid>(type: "uuid", nullable: false),
                    doctorid = table.Column<Guid>(type: "uuid", nullable: false),
                    patientid = table.Column<Guid>(type: "uuid", nullable: false),
                    diagnosis = table.Column<string>(type: "text", nullable: false),
                    medicines = table.Column<string>(type: "text", nullable: false),
                    instructions = table.Column<string>(type: "text", nullable: true),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prescriptions", x => x.id);
                    table.ForeignKey(
                        name: "FK_prescriptions_appointments_appointmentid",
                        column: x => x.appointmentid,
                        principalSchema: "public",
                        principalTable: "appointments",
                        principalColumn: "appointmentid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_prescriptions_users_doctorid",
                        column: x => x.doctorid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_prescriptions_users_patientid",
                        column: x => x.patientid,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_doctorid",
                schema: "public",
                table: "appointments",
                column: "doctorid");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_patientid",
                schema: "public",
                table: "appointments",
                column: "patientid");

            migrationBuilder.CreateIndex(
                name: "IX_documents_patientid",
                schema: "public",
                table: "documents",
                column: "patientid");

            migrationBuilder.CreateIndex(
                name: "IX_prescriptions_appointmentid",
                schema: "public",
                table: "prescriptions",
                column: "appointmentid");

            migrationBuilder.CreateIndex(
                name: "IX_prescriptions_doctorid",
                schema: "public",
                table: "prescriptions",
                column: "doctorid");

            migrationBuilder.CreateIndex(
                name: "IX_prescriptions_patientid",
                schema: "public",
                table: "prescriptions",
                column: "patientid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "documents",
                schema: "public");

            migrationBuilder.DropTable(
                name: "prescriptions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "appointments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "users",
                schema: "public");
        }
    }
}
