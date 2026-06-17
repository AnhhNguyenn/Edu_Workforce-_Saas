using System;

namespace EduOps.Api.Attributes
{
    [AttributeUsage(AttributeTargets.Method)]
    public class IdempotentAttribute : Attribute
    {
    }
}
