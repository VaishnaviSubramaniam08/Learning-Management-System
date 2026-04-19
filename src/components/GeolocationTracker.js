import React, { useState, useEffect, useRef } from 'react';

const GeolocationTracker = ({ onLocationUpdate, targetLocation, geofenceRadius = 100, onClose }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    setLocationError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSuccess(position);
      },
      (error) => {
        handleLocationError(error);
      },
      options
    );

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        handleLocationSuccess(position);
      },
      (error) => {
        handleLocationError(error);
      },
      options
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handleLocationSuccess = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const location = { latitude, longitude, accuracy };
    
    setCurrentLocation(location);
    setAccuracy(accuracy);
    setLastUpdate(new Date().toLocaleTimeString());

    if (targetLocation) {
      const distanceInMeters = calculateDistance(
        latitude, longitude,
        targetLocation.latitude, targetLocation.longitude
      );
      setDistance(distanceInMeters);
      setIsWithinGeofence(distanceInMeters <= geofenceRadius);
    }

    if (onLocationUpdate) {
      onLocationUpdate(location);
    }
  };

  const handleLocationError = (error) => {
    let errorMessage = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location services.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = 'An unknown error occurred while getting location.';
        break;
    }
    setLocationError(errorMessage);
    setIsTracking(false);
  };

  const getLocationStatus = () => {
    if (!currentLocation) return 'No location data';
    if (!targetLocation) return 'Location tracked (no target set)';
    if (isWithinGeofence) return '✅ Within attendance zone';
    return '❌ Outside attendance zone';
  };

  const getDistanceText = () => {
    if (!distance) return 'N/A';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(2)}km`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📍 Location Tracker</h3>

        {locationError && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong>Error:</strong> {locationError}
          </div>
        )}

        {/* Location Status */}
        <div style={{
          background: isWithinGeofence ? '#e8f5e8' : '#fff3cd',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: isWithinGeofence ? '2px solid #28a745' : '2px solid #ffc107'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: isWithinGeofence ? '#28a745' : '#856404' 
          }}>
            {getLocationStatus()}
          </h4>

          {currentLocation && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Current Location:</strong>
                <div style={{
                  background: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  border: '1px solid #ddd'
                }}>
                  Lat: {currentLocation.latitude.toFixed(6)}
                  <br />
                  Lng: {currentLocation.longitude.toFixed(6)}
                </div>
              </div>

              {targetLocation && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Target Location:</strong>
                  <div style={{
                    background: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    border: '1px solid #ddd'
                  }}>
                    Lat: {targetLocation.latitude.toFixed(6)}
                    <br />
                    Lng: {targetLocation.longitude.toFixed(6)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span><strong>Distance:</strong> {getDistanceText()}</span>
                <span><strong>Accuracy:</strong> ±{Math.round(accuracy)}m</span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Geofence Radius:</strong> {geofenceRadius}m
              </div>

              {lastUpdate && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Last Update:</strong> {lastUpdate}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isTracking ? (
            <button
              onClick={startLocationTracking}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎯 Start Tracking
            </button>
          ) : (
            <button
              onClick={stopLocationTracking}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⏹️ Stop Tracking
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: '#f8f9fa',
              color: '#6c757d',
              border: '2px solid #6c757d',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer'
            }}
          >
            ❌ Close
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          <strong>Instructions:</strong>
          <ul style={{ textAlign: 'left', margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>Enable location services in your browser</li>
            <li>Allow location access when prompted</li>
            <li>Stay within the geofence radius to mark attendance</li>
            <li>Location accuracy improves with better GPS signal</li>
            <li>Tracking continues until manually stopped</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#fff3cd',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#856404'
        }}>
          <strong>Privacy:</strong> Your location is only used for attendance verification and is not stored permanently.
        </div>
      </div>
    </div>
  );
};

export default GeolocationTracker; 