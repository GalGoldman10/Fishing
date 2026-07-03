export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<{
        id: string;
        display_name: string | null;
        avatar_url: string | null;
        preferred_language: string;
        experience_level: string;
        default_units: string;
        country_code: string | null;
        created_at: string;
        updated_at: string;
      }, { id: string; display_name?: string | null }>;
      fishing_spots: TableDef<{
        id: string;
        slug: string;
        name: string;
        localized_names: Json;
        country_code: string;
        verification_status: string;
      }>;
      species: TableDef<{
        id: string;
        common_name: string;
        scientific_name: string | null;
        localized_names: Json;
        aliases: string[];
        habitat: string | null;
        environment_types: string[];
        conservation_status: string | null;
      }>;
      favorites: TableDef<
        { user_id: string; spot_id: string; created_at: string },
        { user_id: string; spot_id: string }
      >;
      trip_plans: TableDef<
        {
          id: string;
          user_id: string;
          spot_id: string;
          planned_start: string;
          planned_end: string | null;
          target_species_ids: string[] | null;
          selected_method: string | null;
          equipment_checklist: Json | null;
          notes: string | null;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          spot_id: string;
          planned_start: string;
          planned_end?: string | null;
          target_species_ids?: string[] | null;
          selected_method?: string | null;
          equipment_checklist?: Json | null;
          notes?: string | null;
          notification_enabled?: boolean;
        }
      >;
      catch_logs: TableDef<
        {
          id: string;
          user_id: string;
          spot_id: string | null;
          species_id: string | null;
          caught_at: string;
          estimated_length: number | null;
          estimated_weight: number | null;
          bait_or_lure: string | null;
          fishing_method: string | null;
          released: boolean;
          notes: string | null;
          image_path: string | null;
          visibility: string;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          caught_at: string;
          spot_id?: string | null;
          species_id?: string | null;
          estimated_length?: number | null;
          estimated_weight?: number | null;
          bait_or_lure?: string | null;
          fishing_method?: string | null;
          released?: boolean;
          notes?: string | null;
          visibility?: string;
        }
      >;
      chat_sessions: TableDef<{
        id: string;
        user_id: string | null;
        language: string;
        created_at: string;
      }>;
      chat_messages: TableDef<{
        id: string;
        session_id: string;
        role: string;
        text: string | null;
        created_at: string;
      }>;
    };
    Functions: {
      search_fishing_spots: {
        Args: {
          p_query?: string | null;
          p_lat?: number | null;
          p_lng?: number | null;
          p_radius_km?: number;
        };
        Returns: Json;
      };
      get_fishing_spot_details: {
        Args: { p_spot_id: string };
        Returns: Json;
      };
      get_nearby_spots: {
        Args: { p_lat: number; p_lng: number; p_radius_km?: number };
        Returns: Json;
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
  };
}
