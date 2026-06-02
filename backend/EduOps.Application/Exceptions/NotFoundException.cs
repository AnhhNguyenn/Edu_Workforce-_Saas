using System.Net;

namespace EduOps.Application.Exceptions
{
    public class NotFoundException : BaseCustomException
    {
        public NotFoundException(string name, object key)
            : base($"Entity \"{name}\" ({key}) was not found.", HttpStatusCode.NotFound)
        {
        }
    }
}
