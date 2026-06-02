using System;
using Microsoft.AspNetCore.Mvc;

namespace EduOps.Api.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class FeatureGateAttribute : TypeFilterAttribute
    {
        public FeatureGateAttribute(string featureKey) : base(typeof(FeatureGateFilter))
        {
            Arguments = new object[] { featureKey };
        }
    }
}
