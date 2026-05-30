using System;
using System.IO;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Auth;

namespace EduOps.Application.Interfaces
{
    public interface IProfileService
    {
        Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType);
        Task<UserDto> GetProfileAsync(Guid userId);
    }
}
