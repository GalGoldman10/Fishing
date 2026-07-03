-- Database functions for spot search and details

CREATE OR REPLACE FUNCTION search_fishing_spots(
  p_query TEXT DEFAULT NULL,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_radius_km DOUBLE PRECISION DEFAULT 25
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      fs.id,
      fs.slug,
      fs.name,
      fs.localized_names AS "localizedNames",
      fs.country_code AS "countryCode",
      fs.region,
      fs.environment_type AS "environmentType",
      fs.shore_type AS "shoreType",
      fs.seabed_type AS "seabedType",
      ST_Y(fs.location::geometry) AS latitude,
      ST_X(fs.location::geometry) AS longitude,
      fs.difficulty_level AS "difficultyLevel",
      fs.verification_status AS "verificationStatus",
      fs.confidence_score AS "confidenceScore",
      CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
        ST_Distance(fs.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) / 1000.0
      ELSE NULL END AS "distanceKm"
    FROM fishing_spots fs
    WHERE
      (p_query IS NULL OR fs.name ILIKE '%' || p_query || '%' OR fs.region ILIKE '%' || p_query || '%')
      AND (
        p_lat IS NULL OR p_lng IS NULL OR
        ST_DWithin(fs.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_km * 1000)
      )
    ORDER BY
      CASE WHEN p_lat IS NOT NULL THEN
        ST_Distance(fs.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
      ELSE 0 END
    LIMIT 50
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_nearby_spots(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 25
)
RETURNS JSON AS $$
BEGIN
  RETURN search_fishing_spots(NULL, p_lat, p_lng, p_radius_km);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_fishing_spot_details(p_spot_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', fs.id,
    'slug', fs.slug,
    'name', fs.name,
    'localizedNames', fs.localized_names,
    'description', fs.description,
    'countryCode', fs.country_code,
    'region', fs.region,
    'municipality', fs.municipality,
    'environmentType', fs.environment_type,
    'shoreType', fs.shore_type,
    'seabedType', fs.seabed_type,
    'latitude', ST_Y(fs.location::geometry),
    'longitude', ST_X(fs.location::geometry),
    'accessType', fs.access_type,
    'parkingInformation', fs.parking_information,
    'accessibilityInformation', fs.accessibility_information,
    'difficultyLevel', fs.difficulty_level,
    'suitableForChildren', fs.suitable_for_children,
    'nightAccess', fs.night_access,
    'boatAccess', fs.boat_access,
    'fishingMethods', fs.fishing_methods,
    'hazardLevel', fs.hazard_level,
    'hazardNotes', fs.hazard_notes,
    'verificationStatus', fs.verification_status,
    'confidenceScore', fs.confidence_score,
    'verifiedAt', fs.verified_at,
    'species', (
      SELECT COALESCE(json_agg(json_build_object(
        'speciesId', s.id,
        'commonName', s.common_name,
        'scientificName', s.scientific_name,
        'localizedNames', s.localized_names,
        'likelihood', ss.likelihood,
        'seasonalMonths', ss.seasonal_months,
        'preferredMethods', ss.preferred_methods,
        'preferredBaits', ss.preferred_baits,
        'confidenceScore', ss.confidence_score
      )), '[]'::json)
      FROM spot_species ss JOIN species s ON s.id = ss.species_id WHERE ss.spot_id = fs.id
    ),
    'equipment', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', er.id,
        'fishingMethod', er.fishing_method,
        'experienceLevel', er.experience_level,
        'rodSpecification', er.rod_specification,
        'reelSpecification', er.reel_specification,
        'lineSpecification', er.line_specification,
        'leaderSpecification', er.leader_specification,
        'terminalTackle', er.terminal_tackle,
        'baitAndLures', er.bait_and_lures,
        'accessories', er.accessories,
        'reasoning', er.reasoning,
        'confidenceScore', er.confidence_score
      )), '[]'::json)
      FROM equipment_recommendations er WHERE er.spot_id = fs.id
    ),
    'hazards', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', h.id, 'type', h.type, 'severity', h.severity,
        'title', h.title, 'description', h.description,
        'seasonalMonths', h.seasonal_months
      )), '[]'::json)
      FROM hazards h WHERE h.spot_id = fs.id
    ),
    'regulations', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', r.id, 'title', r.title, 'summary', r.summary,
        'licenseRequired', r.license_required,
        'minimumSize', r.minimum_size,
        'bagLimit', r.bag_limit,
        'closedSeason', r.closed_season,
        'effectiveFrom', r.effective_from,
        'lastCheckedAt', r.last_checked_at
      )), '[]'::json)
      FROM regulations r WHERE r.country_code = fs.country_code
        AND (r.region IS NULL OR r.region = fs.region)
    ),
    'sources', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', src.id, 'title', src.title,
        'organization', src.organization, 'url', src.url,
        'checkedAt', src.checked_at, 'reliabilityLevel', src.reliability_level
      )), '[]'::json)
      FROM sources src
      WHERE src.id IN (
        SELECT DISTINCT source_id FROM spot_species WHERE spot_id = fs.id AND source_id IS NOT NULL
        UNION SELECT DISTINCT source_id FROM equipment_recommendations WHERE spot_id = fs.id AND source_id IS NOT NULL
        UNION SELECT DISTINCT source_id FROM hazards WHERE spot_id = fs.id AND source_id IS NOT NULL
      )
    )
  ) INTO result
  FROM fishing_spots fs
  WHERE fs.id = p_spot_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
