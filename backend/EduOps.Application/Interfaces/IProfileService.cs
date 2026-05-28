using System;
using System.IO;
using System.Threading.Tasks;

namespace EduOps.Application.Interfaces
{
    public interface IProfileService
    {
        Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType);
    }
}
