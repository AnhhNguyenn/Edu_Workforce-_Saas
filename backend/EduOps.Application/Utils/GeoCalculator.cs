using System;

namespace EduOps.Application.Utils
{
    public static class GeoCalculator
    {
        private const double EarthRadiusKm = 6371.0;

        /// <summary>
        /// Calculates the distance between two GPS coordinates in meters using the Haversine formula.
        /// </summary>
        public static double HaversineDistanceInMeters(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            var dLat = DegreesToRadians((double)(lat2 - lat1));
            var dLon = DegreesToRadians((double)(lon2 - lon1));

            var rLat1 = DegreesToRadians((double)lat1);
            var rLat2 = DegreesToRadians((double)lat2);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2) * Math.Cos(rLat1) * Math.Cos(rLat2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return EarthRadiusKm * c * 1000; // Return in meters
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}
