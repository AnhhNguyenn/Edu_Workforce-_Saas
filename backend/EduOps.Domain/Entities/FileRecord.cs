using System;

namespace EduOps.Domain.Entities
{
    public class FileRecord : TenantEntity // Bảng files trong spec
    {
        public Guid UploadedBy { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string OriginalName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long FileSize { get; set; }
    }
}
