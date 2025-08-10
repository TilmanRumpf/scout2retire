import { useState, useEffect } from 'react';
import { getFieldOptions, isMultiSelectField } from '../utils/townDataOptions';
import { getSortedWaterBodies } from '../utils/waterBodyMappings';
import { getSortedRegions, getSortedGeoRegions } from '../utils/geographicMappings';

const SmartFieldEditor = ({ 
  fieldName, 
  currentValue, 
  onSave, 
  onCancel,
  townData // Added to provide context for intelligent filtering
}) => {
  const [value, setValue] = useState(currentValue || '');
  const [options, setOptions] = useState([]);
  const [fieldType, setFieldType] = useState('text');

  useEffect(() => {
    loadFieldOptions();
  }, [fieldName]);

  const loadFieldOptions = () => {
    // Special handling for water_bodies field with intelligent filtering
    if (fieldName === 'water_bodies' && townData) {
      const { relevant, other } = getSortedWaterBodies(townData.country, townData.geo_region);
      
      // Create options with grouping
      const waterBodyOptions = [
        ...relevant.map(body => ({ value: body, group: 'Relevant for this location' })),
        ...other.map(body => ({ value: body, group: 'Other water bodies' }))
      ];
      
      setOptions(waterBodyOptions);
      setFieldType('multiselect-grouped');
      return;
    }
    
    // Special handling for regions field with intelligent filtering
    if (fieldName === 'regions' && townData && townData.country) {
      const allRegions = getFieldOptions('regions') || [];
      const { relevant, other } = getSortedRegions(townData.country, allRegions);
      
      // Create options with grouping
      const regionOptions = [
        ...relevant.map(region => ({ value: region, group: 'Relevant for this location' })),
        ...other.map(region => ({ value: region, group: 'Other regions' }))
      ];
      
      setOptions(regionOptions);
      setFieldType('multiselect-grouped');
      return;
    }
    
    // Special handling for geo_region field with intelligent filtering
    if (fieldName === 'geo_region' && townData && townData.country) {
      const allGeoRegions = getFieldOptions('geo_region') || [];
      const { relevant, other } = getSortedGeoRegions(townData.country, allGeoRegions);
      
      // Create options with grouping
      const geoRegionOptions = [
        ...relevant.map(region => ({ value: region, group: 'Relevant for this location' })),
        ...other.map(region => ({ value: region, group: 'Other geo regions' }))
      ];
      
      setOptions(geoRegionOptions);
      setFieldType('multiselect-grouped');
      return;
    }
    
    // Get options from townDataOptions.js
    const fieldOptions = getFieldOptions(fieldName);
    
    if (fieldOptions) {
      setOptions(fieldOptions);
      
      // Determine field type based on options
      if (fieldOptions === true || fieldOptions === false) {
        setFieldType('boolean');
      } else if (Array.isArray(fieldOptions) && fieldOptions.length > 0) {
        if (typeof fieldOptions[0] === 'object' && fieldOptions[0].value !== undefined) {
          setFieldType('boolean');
        } else if (isMultiSelectField(fieldName)) {
          setFieldType('multiselect');
        } else {
          setFieldType('select');
        }
      }
    } else {
      // Determine field type by name patterns
      switch(fieldName) {
        case 'avg_temp_summer':
        case 'avg_temp_winter':
        case 'sunshine_hours':
        case 'annual_rainfall':
          setFieldType('number');
          break;
        
        case 'typical_monthly_living_cost':
        case 'cost_of_living_usd':
        case 'rent_1bed':
          setFieldType('currency');
          break;
        
        case 'airport_distance':
        case 'nearest_major_hospital_km':
        case 'distance_to_ocean_km':
          setFieldType('distance');
          break;
        
        case 'population':
          setFieldType('population');
          break;
        
        case 'description':
        case 'appealStatement':
        case 'safety_description':
        case 'healthcare_description':
        case 'climate_description':
          setFieldType('textarea');
          break;
        
        case 'latitude':
        case 'longitude':
          setFieldType('coordinate');
          break;
        
        case 'elevation_meters':
          setFieldType('elevation');
          break;
        
        case 'air_quality_index':
          setFieldType('aqi');
          break;
        
        case 'image_url_1':
        case 'image_url_2':
        case 'image_url_3':
          setFieldType('url');
          break;
        
        default:
          if (fieldName.includes('score') || fieldName.includes('rating')) {
            setFieldType('score');
            setOptions([0,1,2,3,4,5,6,7,8,9,10]);
          } else if (fieldName.includes('visa') && fieldName.includes('requirements')) {
            setFieldType('json');
          } else {
            setFieldType('text');
          }
      }
    }
  };

  const renderEditor = () => {
    switch(fieldType) {
      case 'select':
        return (
          <select 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-full max-w-xs"
          >
            <option value="">-- Select --</option>
            {options.map(opt => (
              <option key={opt} value={opt}>
                {/* Capitalize first letter for display */}
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        const currentArray = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="max-h-32 overflow-y-auto border rounded p-2">
              {options.map(opt => (
                <label key={opt} className="flex items-center gap-2 hover:bg-gray-50 p-1">
                  <input
                    type="checkbox"
                    checked={currentArray.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue([...currentArray, opt]);
                      } else {
                        setValue(currentArray.filter(v => v !== opt));
                      }
                    }}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              Selected: {currentArray.join(', ') || 'None'}
            </div>
          </div>
        );
      
      case 'multiselect-grouped':
        const currentGroupedArray = Array.isArray(value) ? value : [];
        const grouped = {};
        
        // Group options
        options.forEach(opt => {
          const group = opt.group || 'Other';
          if (!grouped[group]) grouped[group] = [];
          grouped[group].push(opt.value);
        });
        
        return (
          <div className="space-y-2">
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {Object.entries(grouped).map(([groupName, items]) => (
                <div key={groupName} className="mb-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1 px-1 py-0.5 bg-gray-100 rounded">
                    {groupName}
                  </div>
                  {items.map(item => (
                    <label key={item} className="flex items-center gap-2 hover:bg-gray-50 p-1">
                      <input
                        type="checkbox"
                        checked={currentGroupedArray.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue([...currentGroupedArray, item]);
                          } else {
                            setValue(currentGroupedArray.filter(v => v !== item));
                          }
                        }}
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              Selected: {currentGroupedArray.join(', ') || 'None'}
            </div>
          </div>
        );
      
      case 'score':
        return (
          <select 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select Score --</option>
            {options.map(score => (
              <option key={score} value={score}>
                {score} / 10
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <select 
            value={value === true ? 'true' : value === false ? 'false' : ''} 
            onChange={(e) => setValue(e.target.value === 'true')}
            className="border rounded px-2 py-1"
          >
            <option value="">-- Select --</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      
      case 'currency':
        return (
          <div className="flex items-center gap-1">
            <span>$</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-2 py-1 w-32"
              min="0"
              step="100"
            />
            <span className="text-sm text-gray-500">/month</span>
          </div>
        );
      
      case 'distance':
        return (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-2 py-1 w-24"
              min="0"
              step="1"
            />
            <span className="text-sm text-gray-500">km</span>
          </div>
        );
      
      case 'elevation':
        return (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-2 py-1 w-24"
              min="-500"
              max="9000"
              step="10"
            />
            <span className="text-sm text-gray-500">meters</span>
          </div>
        );
      
      case 'coordinate':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-32"
            step="0.0001"
            placeholder={fieldName === 'latitude' ? '±90.0000' : '±180.0000'}
          />
        );
      
      case 'population':
        return (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-2 py-1 w-32"
              min="0"
              step="1000"
            />
            <span className="text-sm text-gray-500">people</span>
          </div>
        );
      
      case 'aqi':
        return (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border rounded px-2 py-1 w-24"
              min="0"
              max="500"
              step="1"
            />
            <span className="text-sm text-gray-500">
              {value < 51 ? '(Good)' : 
               value < 101 ? '(Moderate)' : 
               value < 151 ? '(Unhealthy for Sensitive)' :
               value < 201 ? '(Unhealthy)' :
               value < 301 ? '(Very Unhealthy)' : '(Hazardous)'}
            </span>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-32"
            step="any"
          />
        );
      
      case 'url':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder="https://..."
          />
        );
      
      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-full font-mono text-xs"
            rows="3"
            placeholder="JSON format"
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            rows="3"
            placeholder={`Enter ${fieldName.replace(/_/g, ' ')}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            placeholder={`Enter ${fieldName.replace(/_/g, ' ')}`}
          />
        );
    }
  };

  const handleSave = () => {
    let valueToSave = value;
    
    // Parse JSON strings for json fields
    if (fieldType === 'json' && typeof value === 'string') {
      try {
        valueToSave = JSON.parse(value);
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }
    
    // Convert numeric strings to numbers for numeric fields
    if (['number', 'score', 'currency', 'distance', 'elevation', 'coordinate', 'population', 'aqi'].includes(fieldType)) {
      valueToSave = value === '' ? null : Number(value);
    }
    
    onSave(valueToSave);
  };

  return (
    <div className="flex gap-2 items-center">
      {renderEditor()}
      <button 
        onClick={handleSave}
        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
      >
        Save
      </button>
      <button 
        onClick={onCancel}
        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
      >
        Cancel
      </button>
    </div>
  );
};

export default SmartFieldEditor;