import React from 'react';
import { uiConfig } from '../../styles/uiConfig';

const TownHealthcare = React.memo(({ town }) => {
  if (!town) return null;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Healthcare Score */}
      {town.healthcareScore && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Healthcare Quality Score</div>
          <div className="flex items-center gap-2">
            <div className={`h-2 ${uiConfig.colors.secondary} rounded-full flex-1`}>
              <div
                className={`h-full ${
                  town.healthcareScore >= 80 ? uiConfig.colors.success :
                  town.healthcareScore >= 60 ? uiConfig.colors.warning :
                  uiConfig.colors.error
                } rounded-full transition-all duration-300`}
                style={{ width: `${town.healthcareScore}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${uiConfig.colors.body}`}>
              {town.healthcareScore}/100
            </span>
          </div>
        </div>
      )}

      {/* Nearest Hospital */}
      {town.nearestHospital && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Nearest Hospital</div>
          <div className={`text-sm ${uiConfig.colors.body}`}>
            {town.nearestHospital.name}
          </div>
          {town.nearestHospital.distance && (
            <div className={`text-xs ${uiConfig.colors.subtitle}`}>
              {town.nearestHospital.distance} miles
            </div>
          )}
        </div>
      )}

      {/* Medical Facilities */}
      {town.medicalFacilities && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1.5`}>Medical Facilities</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Hospitals:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.medicalFacilities.hospitals || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Urgent Care:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.medicalFacilities.urgentCare || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${uiConfig.colors.body}`}>Specialists:</span>
              <span className={`text-xs ${uiConfig.colors.body}`}>
                {town.medicalFacilities.specialists || 0}+
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Medicare Quality */}
      {town.medicareQuality && (
        <div>
          <div className={`text-xs ${uiConfig.colors.subtitle} mb-1`}>Medicare Rating</div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < town.medicareQuality ? uiConfig.colors.accent : uiConfig.colors.subtitle}
              >
                ★
              </span>
            ))}
            <span className={`text-xs ${uiConfig.colors.subtitle} ml-1`}>
              ({town.medicareQuality}/5)
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

TownHealthcare.displayName = 'TownHealthcare';

export default TownHealthcare;