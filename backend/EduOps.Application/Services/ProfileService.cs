using System;
using System.IO;
using System.Threading.Tasks;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Application.DTOs.Auth;
using EduOps.Application.DTOs.User.Responses;
using EduOps.Application.DTOs.User.Requests;
using EduOps.Application.Mappings;
using EduOps.Domain.Entities;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;

        public ProfileService(IUnitOfWork unitOfWork, IStorageService storageService)
        {
            _unitOfWork = unitOfWork;
            _storageService = storageService;
        }

        public async Task<UserDetailResponseDto> GetProfileAsync(Guid userId)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null || user.DeletedAt != null) throw new NotFoundException("User", userId);
            user.UserDetail = await _unitOfWork.Repository<UserDetail>().FirstOrDefaultAsync(d => d.UserId == userId);

            return user.ToDetailResponseDto();
        }

        public async Task<string> UploadAvatarAsync(Guid userId, Stream fileStream, string fileName, string contentType)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(userId);

            if (user == null)
                throw new NotFoundException("User", userId);
            
            user.UserDetail = await _unitOfWork.Repository<UserDetail>().FirstOrDefaultAsync(d => d.UserId == userId);

            // Upload lên Cloudflare R2
            var avatarUrl = await _storageService.UploadFileAsync(fileStream, fileName, contentType);

            if (user.UserDetail == null)
            {
                user.UserDetail = new UserDetail { UserId = user.Id };
                await _unitOfWork.Repository<UserDetail>().AddAsync(user.UserDetail);
            }

            // Xóa ảnh cũ trên R2 nếu có
            if (!string.IsNullOrEmpty(user.UserDetail.AvatarUrl))
            {
                try
                {
                    await _storageService.DeleteFileAsync(user.UserDetail.AvatarUrl);
                }
                catch
                {
                    // Ignore lỗi nếu file không tồn tại
                }
            }

            // Cập nhật URL mới
            user.UserDetail.AvatarUrl = avatarUrl;
            _unitOfWork.Repository<UserDetail>().Update(user.UserDetail);
            await _unitOfWork.CommitAsync();

            return avatarUrl;
        }

        public async Task UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
        {
            var repo = _unitOfWork.Repository<User>();
            var user = await repo.GetByIdAsync(userId);

            if (user == null || user.DeletedAt != null)
                throw new NotFoundException("User", userId);
                
            user.UserDetail = await _unitOfWork.Repository<UserDetail>().FirstOrDefaultAsync(d => d.UserId == userId);

            // Chỉ cho phép cập nhật các trường an toàn (SĐT, Địa chỉ)
            user.Phone = request.Phone ?? string.Empty;
            
            if (user.UserDetail == null)
            {
                user.UserDetail = new UserDetail { UserId = user.Id };
                await _unitOfWork.Repository<UserDetail>().AddAsync(user.UserDetail);
            }
            
            user.UserDetail.Address = request.Address ?? string.Empty;
            _unitOfWork.Repository<UserDetail>().Update(user.UserDetail);

            repo.Update(user);
            await _unitOfWork.CommitAsync();
        }
    }
}
