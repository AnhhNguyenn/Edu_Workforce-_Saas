using System;
using EduOps.Domain.Enums;

namespace EduOps.Domain.Entities
{
    public class SystemSetting : BaseEntity
    {
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public SettingValueType ValueType { get; set; }

        /// <summary>
        /// True: Allows public endpoint to fetch this setting (e.g., Bank Account Number).
        /// False: Strictly for internal Backend use (e.g., Secret Keys, Feature Flags).
        /// </summary>
        public bool IsPublic { get; set; }
    }
}
