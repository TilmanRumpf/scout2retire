import React, { useState, useEffect, useRef } from 'react';
import { uiConfig } from '../styles/uiConfig';
import { X, Users, Check, Lock, Shield, Globe, Eye, Upload, Image as ImageIcon, Search } from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { canCreateSensitiveGroups, getTierDisplayName } from '../utils/accountTiers';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'general', label: '💬 General Chat', emoji: '💬' },
  { id: 'hobbies', label: '🎯 Hobbies', emoji: '🎯', requiresGeo: false },
  { id: 'destinations', label: '📍 Destinations', emoji: '📍', requiresGeo: true },
  { id: 'lifestyle', label: '🎨 Lifestyle & Activities', emoji: '🎨', requiresGeo: false },
  { id: 'moving', label: '✈️ Moving & Visas', emoji: '✈️', requiresGeo: true },
  { id: 'money', label: '💰 Money Matters', emoji: '💰', requiresGeo: true },
  { id: 'housing', label: '🏠 Housing', emoji: '🏠', requiresGeo: true },
  { id: 'health', label: '🏥 Health & Safety', emoji: '🏥', requiresGeo: true },
  { id: 'community', label: '👥 Community & Culture', emoji: '👥', requiresGeo: true },
  { id: 'pets', label: '🐕 Pets & Family', emoji: '🐕', requiresGeo: false }
];

const REGION_COUNTRIES = {
  'North America': ['United States', 'Canada', 'Mexico', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
  'Caribbean': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Cuba', 'Dominica', 'Dominican Republic', 'Grenada', 'Haiti', 'Jamaica', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago'],
  'Central America': ['Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panama'],
  'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'French Guiana', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
  'Northern Europe': ['Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland', 'Estonia', 'Latvia', 'Lithuania'],
  'Western Europe': ['United Kingdom', 'Ireland', 'France', 'Netherlands', 'Belgium', 'Luxembourg', 'Germany', 'Austria', 'Switzerland'],
  'Eastern Europe': ['Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Russia', 'Ukraine', 'Belarus', 'Moldova'],
  'Southern Europe': ['Spain', 'Portugal', 'Italy', 'Croatia', 'Slovenia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'North Macedonia', 'Greece'],
  'Mediterranean': ['Spain', 'France', 'Monaco', 'Italy', 'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'Greece', 'Turkey', 'Cyprus', 'Syria', 'Lebanon', 'Israel', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Malta'],
  'North Africa': ['Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan'],
  'West Africa': ['Nigeria', 'Ghana', 'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Guinea', 'Benin', 'Togo', 'Sierra Leone', 'Liberia', 'Mauritania', 'Gambia', 'Guinea-Bissau'],
  'East Africa': ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Somalia', 'Djibouti', 'Eritrea'],
  'Southern Africa': ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Zambia', 'Mozambique', 'Angola', 'Malawi', 'Lesotho', 'Eswatini'],
  'Middle East': ['Turkey', 'Syria', 'Lebanon', 'Israel', 'Palestine', 'Jordan', 'Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait', 'Iraq', 'Iran'],
  'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Afghanistan'],
  'Indian Ocean': ['Mauritius', 'Seychelles', 'Madagascar', 'Maldives', 'Sri Lanka'],
  'Southeast Asia': ['Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Brunei', 'East Timor'],
  'East Asia': ['China', 'Japan', 'South Korea', 'North Korea', 'Mongolia', 'Taiwan'],
  'Pacific Islands': ['Fiji', 'Samoa', 'Tonga', 'Vanuatu', 'Solomon Islands', 'French Polynesia', 'New Caledonia'],
  'Oceania': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'Samoa', 'Tonga']
};

const REGIONS = Object.keys(REGION_COUNTRIES);

const COUNTRY_PROVINCES = {
  'France': ['Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine', 'Auvergne-Rhône-Alpes', 'Île-de-France', 'Bretagne', 'Normandie', 'Hauts-de-France', 'Grand Est', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Pays de la Loire', 'Corsica'],
  'Spain': ['Andalusia', 'Catalonia', 'Valencia', 'Madrid', 'Galicia', 'Castile and León', 'Basque Country', 'Canary Islands', 'Castile-La Mancha', 'Murcia', 'Aragon', 'Extremadura', 'Balearic Islands', 'Asturias', 'Navarre', 'Cantabria', 'La Rioja'],
  'Italy': ['Tuscany', 'Sicily', 'Lombardy', 'Veneto', 'Emilia-Romagna', 'Piedmont', 'Campania', 'Lazio', 'Liguria', 'Marche', 'Abruzzo', 'Friuli-Venezia Giulia', 'Trentino-Alto Adige', 'Umbria', 'Sardinia', 'Calabria', 'Basilicata', 'Molise', 'Valle d\'Aosta'],
  'Portugal': ['Lisbon', 'Porto', 'Algarve', 'Centro', 'Norte', 'Alentejo', 'Azores', 'Madeira'],
  'Germany': ['Bavaria', 'Baden-Württemberg', 'North Rhine-Westphalia', 'Lower Saxony', 'Hesse', 'Saxony', 'Rhineland-Palatinate', 'Schleswig-Holstein', 'Brandenburg', 'Saxony-Anhalt', 'Thuringia', 'Mecklenburg-Vorpommern', 'Hamburg', 'Saarland', 'Bremen', 'Berlin'],
  'Greece': ['Crete', 'Central Macedonia', 'Attica', 'Thessaly', 'Peloponnese', 'Western Greece', 'Central Greece', 'Epirus', 'Ionian Islands', 'Western Macedonia', 'Eastern Macedonia and Thrace', 'North Aegean', 'South Aegean'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'California': ['Northern California', 'Central California', 'Southern California'],
  'Florida': ['North Florida', 'Central Florida', 'South Florida'],
  'Texas': ['East Texas', 'North Texas', 'Central Texas', 'South Texas', 'West Texas'],
  'British Columbia': ['Lower Mainland', 'Vancouver Island', 'Interior', 'Northern BC'],
  'Ontario': ['Southern Ontario', 'Eastern Ontario', 'Central Ontario', 'Northern Ontario'],
  'Quebec': ['Greater Montreal', 'Quebec City', 'Eastern Quebec', 'Northern Quebec'],
  'Mexico': ['Baja California', 'Baja California Sur', 'Sonora', 'Chihuahua', 'Sinaloa', 'Jalisco', 'Nayarit', 'Colima', 'Michoacán', 'Guerrero', 'Oaxaca', 'Chiapas', 'Yucatán', 'Quintana Roo', 'Campeche', 'Tabasco', 'Veracruz', 'Puebla', 'Hidalgo', 'Querétaro', 'Guanajuato', 'San Luis Potosí', 'Zacatecas', 'Aguascalientes', 'Nuevo León', 'Tamaulipas', 'Coahuila', 'Durango', 'Mexico City', 'State of Mexico', 'Morelos', 'Tlaxcala'],
  'Costa Rica': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'],
  'Panama': ['Panama', 'Chiriquí', 'Veraguas', 'Los Santos', 'Herrera', 'Coclé', 'Colón', 'Bocas del Toro', 'Darién', 'Comarca Guna Yala'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'],
  'New Zealand': ['North Island', 'South Island'],
  'Thailand': ['Bangkok', 'Central Thailand', 'Northern Thailand', 'Northeastern Thailand', 'Eastern Thailand', 'Southern Thailand'],
  'Japan': ['Honshu', 'Hokkaido', 'Kyushu', 'Shikoku', 'Okinawa'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul', 'Pernambuco', 'Ceará', 'Pará', 'Santa Catarina', 'Maranhão', 'Goiás', 'Paraíba', 'Espírito Santo', 'Amazonas', 'Mato Grosso', 'Rio Grande do Norte', 'Alagoas', 'Piauí', 'Distrito Federal', 'Mato Grosso do Sul', 'Sergipe', 'Rondônia', 'Acre', 'Amapá', 'Roraima', 'Tocantins']
};

const GroupChatModal = React.memo(function GroupChatModal({
  isOpen,
  onClose,
  friends = [],
  onCreateGroup,
  currentUser
}) {
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState('general');
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({ type: 'worldwide', name: 'Worldwide' });
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [groupType, setGroupType] = useState('public'); // 'sensitive_private', 'semi_private', 'private_open', 'public'
  const [invitePolicy, setInvitePolicy] = useState('all_members');
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const locationInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if user can create Sensitive Private groups
  const canCreateSensitive = canCreateSensitiveGroups(currentUser);

  console.log('GroupChatModal render:', {
    isOpen,
    friendsCount: friends.length,
    friends: friends,
    currentUser,
    currentUserAccountTier: currentUser?.account_tier,
    canCreateSensitive,
    selectedFriends,
    groupName,
    category
  });

  const selectedCategoryObj = CATEGORIES.find(c => c.id === category);
  const requiresGeo = selectedCategoryObj?.requiresGeo;

  // Search for locations when user types
  useEffect(() => {
    const searchLocations = async () => {
      if (!locationSearch || locationSearch.length < 2) {
        setLocationSuggestions([]);
        return;
      }

      const search = locationSearch.toLowerCase();
      const suggestions = [];

      // Search regions
      REGIONS.forEach(region => {
        if (region.toLowerCase().includes(search)) {
          suggestions.push({ type: 'region', name: region });
        }
      });

      // Search countries
      Object.entries(REGION_COUNTRIES).forEach(([region, countries]) => {
        countries.forEach(country => {
          if (country.toLowerCase().includes(search)) {
            suggestions.push({ type: 'country', name: country, region });
          }
        });
      });

      // Search provinces
      Object.entries(COUNTRY_PROVINCES).forEach(([country, provinces]) => {
        provinces.forEach(province => {
          if (province.toLowerCase().includes(search)) {
            suggestions.push({ type: 'province', name: province, country });
          }
        });
      });

      // Search towns from database
      const { data: towns } = await supabase
        .from('towns')
        .select('town_name, country, region')
        .ilike('town_name', `%${search}%`)
        .limit(5);

      if (towns) {
        towns.forEach(town => {
          suggestions.push({
            type: 'town',
            name: town.town_name,
            country: town.country,
            region: town.region
          });
        });
      }

      setLocationSuggestions(suggestions.slice(0, 10));
    };

    searchLocations();
  }, [locationSearch]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const toggleFriend = (friendId) => {
    console.log('🔄 toggleFriend called', { friendId, currentSelectedFriends: selectedFriends });
    setSelectedFriends(prev => {
      const newSelection = prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId];
      console.log('✅ New selection:', newSelection);
      return newSelection;
    });
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const catObj = CATEGORIES.find(c => c.id === newCategory);

    // Reset location when switching to/from categories that don't require geo
    if (newCategory === 'general' || !catObj?.requiresGeo) {
      setSelectedLocation({ type: 'worldwide', name: 'Worldwide' });
      setLocationSearch('');
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationSearch('');
    setShowSuggestions(false);
  };

  const getLocationDisplay = () => {
    if (selectedLocation.type === 'worldwide') {
      return 'Worldwide';
    }
    if (selectedLocation.type === 'town') {
      return `${selectedLocation.name}, ${selectedLocation.country}`;
    }
    if (selectedLocation.type === 'province') {
      return `${selectedLocation.name}, ${selectedLocation.country}`;
    }
    if (selectedLocation.type === 'country') {
      return selectedLocation.name;
    }
    if (selectedLocation.type === 'region') {
      return selectedLocation.name;
    }
    return 'Worldwide';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setGroupImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setGroupImage(null);
    setGroupImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSearch = async () => {
    if (!imageSearchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearchingImages(true);
    try {
      // Use Unsplash API for free, high-quality images
      const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

      if (!unsplashKey) {
        toast.error('Image search not configured. Please upload an image instead.');
        setIsSearchingImages(false);
        return;
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageSearchQuery)}&per_page=12&client_id=${unsplashKey}`
      );

      if (!response.ok) {
        throw new Error('Image search failed');
      }

      const data = await response.json();
      setImageSearchResults(data.results || []);

      if (data.results.length === 0) {
        toast('No images found. Try a different search term.', { icon: '🔍' });
      }
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Failed to search images. Please try uploading instead.');
    } finally {
      setIsSearchingImages(false);
    }
  };

  const handleSelectSearchedImage = async (imageUrl) => {
    try {
      // Download the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], 'group-logo.jpg', { type: 'image/jpeg' });

      // Set it as the group image
      setGroupImage(file);
      setGroupImagePreview(imageUrl);
      setShowImageSearch(false);
      setImageSearchResults([]);
      setImageSearchQuery('');

      toast.success('Image selected!');
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error('Failed to select image');
    }
  };

  const handleCreate = async () => {
    console.log('🎯 handleCreate called', { groupName, selectedFriends, category, selectedLocation });

    if (!groupName.trim()) {
      console.log('❌ Validation failed: No group name');
      alert('Please enter a group name');
      return;
    }
    if (selectedFriends.length === 0) {
      console.log('❌ Validation failed: No friends selected');
      alert('Please select at least one friend');
      return;
    }

    console.log('✅ Validation passed, creating group...');
    setIsCreating(true);
    try {
      let uploadedImageUrl = null;

      // Upload image if selected
      if (groupImage) {
        const fileExt = groupImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `group-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(filePath, groupImage);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload group image');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('group-avatars')
            .getPublicUrl(filePath);
          uploadedImageUrl = publicUrl;
        }
      }

      // Build geographic scope from selectedLocation
      let geographicScope = {
        region: null,
        country: null,
        province: null
      };

      if (selectedLocation.type === 'region') {
        geographicScope.region = selectedLocation.name;
      } else if (selectedLocation.type === 'country') {
        geographicScope.region = selectedLocation.region || null;
        geographicScope.country = selectedLocation.name;
      } else if (selectedLocation.type === 'province') {
        geographicScope.country = selectedLocation.country || null;
        geographicScope.province = selectedLocation.name;
      } else if (selectedLocation.type === 'town') {
        geographicScope.region = selectedLocation.region || null;
        geographicScope.country = selectedLocation.country || null;
        // For towns, we'll store the town name in the group name or description
        // The province field would need town_id if we want to link it
      }

      await onCreateGroup({
        name: groupName,
        category: category,
        geographicScope: geographicScope,
        memberIds: selectedFriends,
        createdBy: currentUser.id,
        isPublic: isPublic,
        groupType: groupType,
        invitePolicy: invitePolicy,
        discoverability: groupType === 'public' ? 'searchable' : (groupType === 'private_open' ? 'link_only' : 'hidden'),
        groupImageUrl: uploadedImageUrl
      });

      // Reset form
      setGroupName('');
      setCategory('general');
      setSelectedLocation({ type: 'worldwide', name: 'Worldwide' });
      setLocationSearch('');
      setSelectedFriends([]);
      setShowSuggestions(false);
      setIsPublic(true);
      setGroupImage(null);
      setGroupImagePreview(null);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error?.message || error?.error?.message || 'Unknown error';
      alert(`Failed to create group chat: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className={`${uiConfig.colors.card} rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-scout-accent-100 dark:bg-scout-accent-900/30 rounded-lg">
              <Users className="h-5 w-5 text-scout-accent-600 dark:text-scout-accent-400" />
            </div>
            <h2 className={`text-xl ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Create Group Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body} transition-colors`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Name Input */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Portugal Explorers, Hiking Enthusiasts..."
              className={`w-full px-4 py-2 ${uiConfig.colors.input} rounded-lg border ${
                groupName.trim() ? uiConfig.colors.border : 'border-red-300 dark:border-red-700'
              } focus:outline-none focus:border-scout-accent-400 transition-all`}
              maxLength={50}
            />
            <p className={`text-xs ${uiConfig.colors.hint} mt-1`}>
              {groupName.length}/50 characters {!groupName.trim() && <span className="text-red-500">• Required</span>}
            </p>
          </div>

          {/* Group Logo/Image Upload */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
              Group Logo
            </label>

            {!groupImagePreview ? (
              <div className="space-y-3">
                {/* Upload or Search buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${uiConfig.colors.border} rounded-lg p-4 text-center cursor-pointer hover:border-scout-accent-400 transition-all group`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-scout-accent-100 dark:group-hover:bg-scout-accent-900/30 transition-colors">
                        <Upload className="h-5 w-5 text-gray-400 group-hover:text-scout-accent-500 transition-colors" />
                      </div>
                      <p className={`text-xs ${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                        Upload Image
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowImageSearch(!showImageSearch)}
                    className={`relative border-2 border-dashed ${uiConfig.colors.border} rounded-lg p-4 text-center cursor-pointer hover:border-scout-accent-400 transition-all group`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-scout-accent-100 dark:group-hover:bg-scout-accent-900/30 transition-colors">
                        <Search className="h-5 w-5 text-gray-400 group-hover:text-scout-accent-500 transition-colors" />
                      </div>
                      <p className={`text-xs ${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                        Search Web
                      </p>
                    </div>
                  </button>
                </div>

                {/* Image Search Interface */}
                {showImageSearch && (
                  <div className={`border-2 ${uiConfig.colors.border} rounded-lg p-4 space-y-3`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageSearchQuery}
                        onChange={(e) => setImageSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleImageSearch()}
                        placeholder="Search for group logo images..."
                        className={`flex-1 px-3 py-2 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 text-sm`}
                      />
                      <button
                        type="button"
                        onClick={handleImageSearch}
                        disabled={isSearchingImages}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSearchingImages
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-scout-accent-500 text-white hover:bg-scout-accent-600'
                        }`}
                      >
                        {isSearchingImages ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {/* Search Results Grid */}
                    {imageSearchResults.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {imageSearchResults.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSearchedImage(image.urls.small)}
                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-scout-accent-400 transition-all group"
                          >
                            <img
                              src={image.urls.thumb}
                              alt={image.alt_description || 'Search result'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                          </button>
                        ))}
                      </div>
                    )}

                    {isSearchingImages && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-accent-500 mx-auto"></div>
                      </div>
                    )}

                    <p className={`text-xs ${uiConfig.colors.hint} text-center`}>
                      Images powered by Unsplash
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className={`border-2 ${uiConfig.colors.border} rounded-lg p-4 flex items-center gap-4`}>
                  {/* Image Preview */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <img
                      src={groupImagePreview}
                      alt="Group logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} truncate`}>
                      {groupImage?.name || 'Group logo'}
                    </div>
                    <div className={`text-xs ${uiConfig.colors.hint}`}>
                      {groupImage && `${(groupImage.size / 1024).toFixed(1)} KB`}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group Type Selection - 4 Tiers */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
              Group Type
            </label>
            <div className="space-y-2">
              {/* Public */}
              <button
                type="button"
                onClick={() => {
                  setGroupType('public');
                  setInvitePolicy('all_members');
                  setIsPublic(true);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  groupType === 'public'
                    ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className={`text-sm ${uiConfig.font.weight.semibold} ${groupType === 'public' ? uiConfig.colors.heading : uiConfig.colors.body}`}>
                    Public
                  </span>
                  {groupType === 'public' && <Check className="w-4 h-4 ml-auto text-scout-accent-500" />}
                </div>
                <div className={`text-xs ${uiConfig.colors.hint}`}>
                  Searchable & discoverable • Anyone can join • Community-run
                </div>
              </button>

              {/* Private-Open */}
              <button
                type="button"
                onClick={() => {
                  setGroupType('private_open');
                  setInvitePolicy('members_with_approval');
                  setIsPublic(false);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  groupType === 'private_open'
                    ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className={`text-sm ${uiConfig.font.weight.semibold} ${groupType === 'private_open' ? uiConfig.colors.heading : uiConfig.colors.body}`}>
                    Private-Open
                  </span>
                  {groupType === 'private_open' && <Check className="w-4 h-4 ml-auto text-scout-accent-500" />}
                </div>
                <div className={`text-xs ${uiConfig.colors.hint}`}>
                  Link-only • Members invite with approval • Grows with you
                </div>
              </button>

              {/* Semi-Private */}
              <button
                type="button"
                onClick={() => {
                  setGroupType('semi_private');
                  setInvitePolicy('admins_only');
                  setIsPublic(false);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  groupType === 'semi_private'
                    ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className={`text-sm ${uiConfig.font.weight.semibold} ${groupType === 'semi_private' ? uiConfig.colors.heading : uiConfig.colors.body}`}>
                    Semi-Private
                  </span>
                  {groupType === 'semi_private' && <Check className="w-4 h-4 ml-auto text-scout-accent-500" />}
                </div>
                <div className={`text-xs ${uiConfig.colors.hint}`}>
                  Hidden • Only admins invite • Vetted community
                </div>
              </button>

              {/* Sensitive Private - Premium+ Only */}
              <button
                type="button"
                onClick={() => {
                  if (!canCreateSensitive) {
                    toast.error('Premium tier or higher required for Sensitive Private groups');
                    return;
                  }
                  setGroupType('sensitive_private');
                  setInvitePolicy('admins_only');
                  setIsPublic(false);
                }}
                disabled={!canCreateSensitive}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  groupType === 'sensitive_private'
                    ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                    : canCreateSensitive
                      ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4" />
                  <span className={`text-sm ${uiConfig.font.weight.semibold} ${groupType === 'sensitive_private' ? uiConfig.colors.heading : uiConfig.colors.body}`}>
                    Sensitive Private
                  </span>
                  {!canCreateSensitive && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                      Premium+
                    </span>
                  )}
                  {groupType === 'sensitive_private' && <Check className="w-4 h-4 ml-auto text-scout-accent-500" />}
                </div>
                <div className={`text-xs ${uiConfig.colors.hint}`}>
                  Ultra-private • Only you invite • Archives when you leave • Max 10 members
                </div>
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
              Topic Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    category === cat.id
                      ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {category === cat.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-scout-accent-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className={`text-sm ${uiConfig.font.weight.medium} ${category === cat.id ? uiConfig.colors.heading : uiConfig.colors.body}`}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Geographic Scope - Only show if category requires it */}
          {requiresGeo && (
            <div className={`p-4 ${uiConfig.layout.radius.lg} bg-scout-accent-50 dark:bg-scout-accent-900/20 border-2 border-scout-accent-200 dark:border-scout-accent-600`}>
              <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
                Geographic Scope
              </label>

              {/* Single Autocomplete Input */}
              <div className="relative" ref={locationInputRef}>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={selectedLocation.type === 'worldwide' ? 'Worldwide (click to search region, country, province, or town)' : getLocationDisplay()}
                  className={`w-full px-4 py-3 ${uiConfig.colors.input} rounded-lg border ${uiConfig.colors.border} focus:outline-none focus:border-scout-accent-400 transition-all ${
                    selectedLocation.type === 'worldwide' ? 'text-gray-400 dark:text-gray-500' : ''
                  }`}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (locationSuggestions.length > 0 || locationSearch.length === 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
                    {/* Show Worldwide as first option when no search */}
                    {locationSearch.length === 0 && (
                      <button
                        type="button"
                        onClick={() => handleLocationSelect({ type: 'worldwide', name: 'Worldwide' })}
                        className="w-full text-left px-4 py-2.5 hover:bg-scout-accent-50 dark:hover:bg-scout-accent-900/20 transition-colors border-b border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg flex-shrink-0">🌍</span>
                          <div className="flex-1">
                            <div className={`text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                              Worldwide
                            </div>
                            <div className={`text-xs ${uiConfig.colors.hint}`}>
                              All regions
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.name}-${index}`}
                        type="button"
                        onClick={() => handleLocationSelect(suggestion)}
                        className="w-full text-left px-4 py-2.5 hover:bg-scout-accent-50 dark:hover:bg-scout-accent-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {/* Icon based on type */}
                          <span className="text-lg flex-shrink-0">
                            {suggestion.type === 'region' && '🌍'}
                            {suggestion.type === 'country' && '🇪🇸'}
                            {suggestion.type === 'province' && '📍'}
                            {suggestion.type === 'town' && '🏘️'}
                          </span>

                          {/* Location name and details */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                              {suggestion.name}
                            </div>
                            {suggestion.country && (
                              <div className={`text-xs ${uiConfig.colors.hint}`}>
                                {suggestion.country}
                                {suggestion.region && ` · ${suggestion.region}`}
                              </div>
                            )}
                            {suggestion.type === 'region' && (
                              <div className={`text-xs ${uiConfig.colors.hint}`}>
                                Region
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Reset to Worldwide button */}
                {selectedLocation.type !== 'worldwide' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation({ type: 'worldwide', name: 'Worldwide' });
                      setLocationSearch('');
                      setShowSuggestions(false);
                    }}
                    className="mt-2 text-xs text-scout-accent-600 hover:text-scout-accent-700 dark:text-scout-accent-400 dark:hover:text-scout-accent-300 underline"
                  >
                    Reset to Worldwide
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Select Friends */}
          <div>
            <label className={`block text-sm ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
              Select Friends <span className="text-red-500">*</span> <span className="text-xs font-normal text-gray-500">({selectedFriends.length} selected)</span>
            </label>

            {friends.length === 0 ? (
              <div className={`text-center py-8 ${uiConfig.colors.hint}`}>
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No friends yet. Invite friends first!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {friends.map(friend => {
                  console.log('🎨 Rendering friend:', friend);
                  return (
                  <button
                    key={friend.friend_id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('👆 Friend clicked:', friend);
                      toggleFriend(friend.friend_id);
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedFriends.includes(friend.friend_id)
                        ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400`}>
                        <span className="text-sm font-medium">
                          {friend.friend?.username?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="flex-1">
                        <div className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>
                          {friend.friend?.username || 'Friend'}
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedFriends.includes(friend.friend_id)
                          ? 'bg-scout-accent-500 border-scout-accent-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedFriends.includes(friend.friend_id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Validation message */}
          {(!groupName.trim() || selectedFriends.length === 0) && (
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <span>⚠️</span>
                <span>
                  {!groupName.trim() && selectedFriends.length === 0 && 'Please enter a group name and select at least one friend'}
                  {!groupName.trim() && selectedFriends.length > 0 && 'Please enter a group name'}
                  {groupName.trim() && selectedFriends.length === 0 && 'Please select at least one friend'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6">
            <button
              onClick={onClose}
              disabled={isCreating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uiConfig.colors.hint} hover:${uiConfig.colors.body}`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('🔘 Create Group button clicked', {
                  disabled: isCreating || !groupName.trim() || selectedFriends.length === 0,
                  groupName,
                  selectedFriends,
                  isCreating
                });
                handleCreate();
              }}
              disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCreating || !groupName.trim() || selectedFriends.length === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-scout-accent-500 text-white hover:bg-scout-accent-600'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GroupChatModal;
