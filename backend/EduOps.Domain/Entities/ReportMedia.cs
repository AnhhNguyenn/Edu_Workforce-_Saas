using System;

namespace EduOps.Domain.Entities
{
    public class ReportMedia : BaseEntity // Không cần Multi-Tenant vì đã map qua Report
    {
        public Guid ReportId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string MimeType { get; set; } = string.Empty;
        public Guid UploadedBy { get; set; }
    }
}
