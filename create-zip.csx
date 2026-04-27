
using System.IO.Compression;
if (File.Exists("deploy.zip")) File.Delete("deploy.zip");
ZipFile.CreateFromDirectory("backend/publish", "deploy.zip");
Console.WriteLine("Created deploy.zip");
