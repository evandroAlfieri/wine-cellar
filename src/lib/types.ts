import { Database } from "@/integrations/supabase/types";

export type DbCountry = Database["public"]["Tables"]["country"]["Row"];
export type DbRegion = Database["public"]["Tables"]["region"]["Row"];
export type DbProducer = Database["public"]["Tables"]["producer"]["Row"];
export type DbWine = Database["public"]["Tables"]["wine"]["Row"];
export type DbBottle = Database["public"]["Tables"]["bottle"]["Row"];
export type DbVarietal = Database["public"]["Tables"]["varietal"]["Row"];

export interface BottleWithDetails extends DbBottle {
  wine: DbWine & {
    producer: DbProducer & {
      country: DbCountry | null;
      region: DbRegion | null;
    };
    wine_varietal: Array<{
      varietal: DbVarietal;
    }>;
  };
}
