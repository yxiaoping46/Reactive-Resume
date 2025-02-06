import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly supabase: SupabaseService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.client.rpc('health_check');
      
      if (error) throw error;
      
      return this.getStatus("database", true);
    } catch (error) {
      return this.getStatus("database", false, { message: error.message });
    }
  }
}
