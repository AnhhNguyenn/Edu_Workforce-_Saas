using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Application.DTOs.Billing;
using EduOps.Application.Exceptions;
using EduOps.Application.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using EduOps.Domain.Interfaces;

namespace EduOps.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SubscriptionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // --- PLANS ---
        public async Task<List<SubscriptionPlanDto>> GetPlansAsync()
        {
            var plans = await _unitOfWork.Repository<SubscriptionPlan>().FindAsync(p => p.Status == AccountStatus.ACTIVE);
            return plans.Select(p => new SubscriptionPlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                MaxUsers = p.MaxUsers,
                PricePerMonth = p.PricePerMonth,
                PricePerYear = p.PricePerYear,
                Status = p.Status
            }).ToList();
        }

        public async Task<SubscriptionPlanDto> CreatePlanAsync(SubscriptionPlanRequestDto request)
        {
            var plan = new SubscriptionPlan
            {
                Name = request.Name,
                Description = request.Description,
                MaxUsers = request.MaxUsers,
                PricePerMonth = request.PricePerMonth,
                PricePerYear = request.PricePerYear,
                Status = AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<SubscriptionPlan>().AddAsync(plan);
            await _unitOfWork.CommitAsync();

            return new SubscriptionPlanDto
            {
                Id = plan.Id,
                Name = plan.Name,
                MaxUsers = plan.MaxUsers,
                PricePerMonth = plan.PricePerMonth,
                PricePerYear = plan.PricePerYear,
                Status = plan.Status
            };
        }

        // --- PROMOTIONS ---
        public async Task<List<PromotionDto>> GetPromotionsAsync()
        {
            var promos = await _unitOfWork.Repository<Promotion>().FindAsync(p => p.Status == AccountStatus.ACTIVE);
            return promos.Select(p => new PromotionDto
            {
                Id = p.Id,
                Code = p.Code,
                Type = p.Type,
                DiscountPercentage = p.DiscountPercentage,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                MaxUses = p.MaxUses,
                CurrentUses = p.CurrentUses,
                Status = p.Status
            }).ToList();
        }

        public async Task<PromotionDto> CreatePromotionAsync(PromotionRequestDto request)
        {
            var promoCode = request.Type == PromotionType.PROMO_CODE && !string.IsNullOrWhiteSpace(request.Code) 
                ? request.Code.Trim().ToUpper() 
                : null;

            var promo = new Promotion
            {
                Code = promoCode,
                Type = request.Type,
                DiscountPercentage = request.DiscountPercentage,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                MaxUses = request.MaxUses,
                CurrentUses = 0,
                Status = AccountStatus.ACTIVE
            };

            await _unitOfWork.Repository<Promotion>().AddAsync(promo);
            await _unitOfWork.CommitAsync();

            return new PromotionDto
            {
                Id = promo.Id,
                Code = promo.Code,
                Type = promo.Type,
                DiscountPercentage = promo.DiscountPercentage,
                StartDate = promo.StartDate,
                EndDate = promo.EndDate,
                MaxUses = promo.MaxUses,
                Status = promo.Status
            };
        }

        // --- SUBSCRIBE & LOGIC GIẢM GIÁ ---
        public async Task<string> SubscribeAsync(Guid orgId, SubscribeRequestDto request)
        {
            var plan = await _unitOfWork.Repository<SubscriptionPlan>().GetByIdAsync(request.PlanId);
            if (plan == null) throw new NotFoundException("SubscriptionPlan", request.PlanId);

            decimal originalPrice = request.BillingCycle == "YEARLY" ? plan.PricePerYear : plan.PricePerMonth;
            decimal finalPrice = originalPrice;
            decimal discountApplied = 0;
            
            var now = DateTime.UtcNow;

            // 1. Kiểm tra Auto Discount đang diễn ra
            var autoPromo = (await _unitOfWork.Repository<Promotion>().FindAsync(
                p => p.Type == PromotionType.AUTO_DISCOUNT && p.Status == AccountStatus.ACTIVE && p.StartDate <= now && p.EndDate >= now
            )).FirstOrDefault();

            if (autoPromo != null)
            {
                discountApplied = autoPromo.DiscountPercentage;
            }
            // 2. Nếu không có Auto Discount, kiểm tra Promo Code do người dùng nhập
            else if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var inputCode = request.PromoCode.Trim().ToUpper();
                var codePromo = (await _unitOfWork.Repository<Promotion>().FindAsync(
                    p => p.Type == PromotionType.PROMO_CODE && p.Code == inputCode && p.Status == AccountStatus.ACTIVE
                )).FirstOrDefault();

                if (codePromo == null) throw new BadRequestException("Mã giảm giá không hợp lệ.");
                if (now < codePromo.StartDate || now > codePromo.EndDate) throw new BadRequestException("Mã giảm giá đã hết hạn.");
                if (codePromo.MaxUses.HasValue && codePromo.CurrentUses >= codePromo.MaxUses.Value)
                    throw new BadRequestException("Mã giảm giá đã hết số lượng sử dụng.");

                discountApplied = codePromo.DiscountPercentage;
                
                // Tăng số lần sử dụng
                codePromo.CurrentUses += 1;
                _unitOfWork.Repository<Promotion>().Update(codePromo);
            }

            finalPrice = originalPrice - (originalPrice * (discountApplied / 100));

            // Nâng cấp Org
            var org = await _unitOfWork.Repository<Organization>().GetByIdAsync(orgId);
            if (org == null) throw new NotFoundException("Organization", orgId);
            
            org.MaxUsers = plan.MaxUsers;
            org.SubscriptionStart = now;
            org.SubscriptionEnd = request.BillingCycle == "YEARLY" ? now.AddYears(1) : now.AddMonths(1);
            _unitOfWork.Repository<Organization>().Update(org);

            // Ghi nhận hóa đơn
            var transaction = new BillingTransaction
            {
                OrganizationId = orgId,
                Amount = finalPrice,
                PlanName = plan.Name,
                PaymentDate = now,
                PaymentMethod = "BANK_TRANSFER", // Giả lập thanh toán
                Status = BillingStatus.PAID
            };
            await _unitOfWork.Repository<BillingTransaction>().AddAsync(transaction);

            await _unitOfWork.CommitAsync();

            return $"Đăng ký gói {plan.Name} thành công. Giá gốc: {originalPrice}, Giảm giá: {discountApplied}%, Thanh toán: {finalPrice}";
        }
    }
}
