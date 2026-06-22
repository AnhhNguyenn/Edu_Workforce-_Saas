using System.IO;
using Microsoft.AspNetCore.Http;

namespace EduOps.Application.DTOs.Academic.Sessions.Requests
{
    public class ImportSessionRequestDto
    {
        public System.Collections.Generic.List<IFormFile> Files { get; set; } = new();
        public bool AutoCreateUsers { get; set; } = true;
        public bool AutoCreateSchools { get; set; } = true;
        public bool AutoCreateClasses { get; set; } = true;
        public bool AutoCreateCustomFields { get; set; } = true;
    }
}
