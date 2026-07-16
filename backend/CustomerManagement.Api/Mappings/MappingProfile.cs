using AutoMapper;
using CustomerManagement.Domain.Models;
using CustomerManagement.Api.DTOs;

namespace CustomerManagement.Api.Mappings
{
    /// AutoMapper profile defining all entity-to-DTO and DTO-to-entity mappings.
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ============================
            // CLIENT
            // ============================

            // Entity -> DTO: resolves LocationId and LocationName from the related entity
            CreateMap<Client, ClientDto>()
                .ForMember(dest => dest.LocationId,
                    opt => opt.MapFrom(src => src.Location != null ? src.Location.LocationId : (int?)null))
                .ForMember(dest => dest.LocationName,
                    opt => opt.MapFrom(src => src.Location != null ? src.Location.Name : null))
                .ForMember(dest => dest.Payments,
                    opt => opt.MapFrom(src => src.Payments));

            CreateMap<CreateClientDto, Client>();
            CreateMap<UpdateClientDto, Client>();


            // ============================
            // DAILY ENTRY
            // ============================

            // Entity -> DTO: resolves LocationId and LocationName from the related entity
            CreateMap<DailyEntry, DailyEntryDto>()
                .ForMember(dest => dest.LocationId,
                    opt => opt.MapFrom(src => src.Location != null ? src.Location.LocationId : (int?)null))
                .ForMember(dest => dest.LocationName,
                    opt => opt.MapFrom(src => src.Location != null ? src.Location.Name : null))
                .ForMember(dest => dest.Payments,
                    opt => opt.MapFrom(src => src.Payments));

            CreateMap<CreateDailyEntryDto, DailyEntry>();
            CreateMap<UpdateDailyEntryDto, DailyEntry>();


            // ============================
            // PAYMENT
            // ============================

            // Entity -> DTO: LocationName is resolved from either the Client or DailyEntry side
            CreateMap<Payment, PaymentDto>()
                .ForMember(dest => dest.ClientId,
                    opt => opt.MapFrom(src => src.ClientId))
                .ForMember(dest => dest.DailyEntryId,
                    opt => opt.MapFrom(src => src.DailyEntryId))
                .ForMember(dest => dest.ClientName,
                    opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : null))
                .ForMember(dest => dest.DailyEntryNotes,
                    opt => opt.MapFrom(src => src.DailyEntry != null ? src.DailyEntry.Notes : null))
                .ForMember(dest => dest.LocationName,
                    opt => opt.MapFrom(src =>
                        src.Client != null && src.Client.Location != null
                            ? src.Client.Location.Name
                            : src.DailyEntry != null && src.DailyEntry.Location != null
                                ? src.DailyEntry.Location.Name
                                : null));

            CreateMap<CreatePaymentDto, Payment>();
            CreateMap<UpdatePaymentDto, Payment>();


            // ============================
            // LOCATION
            // ============================

            // Entity -> DTO: counts are resolved from the navigation collection sizes
            // Key is mapped directly from the domain model
            CreateMap<Location, LocationDto>()
                .ForMember(dest => dest.Key,
                    opt => opt.MapFrom(src => src.Key))
                .ForMember(dest => dest.ClientCount,
                    opt => opt.MapFrom(src => src.Clients.Count))
                .ForMember(dest => dest.DailyEntriesCount,
                    opt => opt.MapFrom(src => src.DailyEntries.Count));

            CreateMap<CreateLocationDto, Location>();
            CreateMap<UpdateLocationDto, Location>();


            // ============================
            // REPORT HISTORY
            // ============================
            CreateMap<ReportHistory, ReportHistoryDto>();
            CreateMap<CreateReportHistoryDto, ReportHistory>();
        }
    }
}