using System;
using System.IO;
using System.Threading.Tasks;
using EduOps.Application.DTOs.User.Responses;
using EduOps.Application.DTOs.User.Requests;

namespace EduOps.Application.Interfaces
{
    public interface IProfileService
    {
        Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType);
        Task<string> UploadOrganizationLogoAsync(Guid userId, Stream fileStream, string fileName, string contentType);
        Task UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request);
        Task<UserDetailResponseDto> GetProfileAsync(Guid userId);
    }
}
