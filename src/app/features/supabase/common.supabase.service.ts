import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgosulbtvqhkihvjuaof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb3N1bGJ0dnFoa2lodmp1YW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzExMTQsImV4cCI6MjA2Nzc0NzExNH0.Tw3V1gHnLscvU0VhjMwExAuQZ_cJoXkqqlx_tl-FR1Y';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  public masters: {
    packageTypes: any[],
    serviceTypes: any[]
  } = {
    packageTypes: [],
    serviceTypes: []
  };

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async loadMasters(): Promise<void> {
    const [packageTypesRes, serviceTypesRes] = await Promise.all([
      this.supabase.from('packagetypes').select('*').order('packagetypeid', { ascending: true }),
      this.supabase.from('servicetypes').select('*').order('servicetypeid', { ascending: true })
    ]);

    if (packageTypesRes.error || serviceTypesRes.error) {
      console.error('Failed to load master tables:', packageTypesRes.error, serviceTypesRes.error);
      return;
    }

    this.masters.packageTypes = packageTypesRes.data || [];
    this.masters.serviceTypes = serviceTypesRes.data || [];
  }

  getPackageTypes() {
    return this.masters.packageTypes;
  }

  getServiceTypes() {
    return this.masters.serviceTypes;
  }

  async insertAdminUser(user: any) {
    return this.supabase.rpc('add_admin_user', user);
  }

  async verifyAdminLogin(loginEmail: any, loginPassword: any){
    const { data, error } = await this.supabase.rpc('verify_admin_login', {
      p_email: loginEmail,
      p_password: loginPassword
    });
    
    if (error) {
      console.error('Login failed:', error);
    } else if (data?.error) {
      console.error('Invalid credentials');
      return {};
    } else {
      console.log('Logged-in user:', data);
      return data;
    }
  }
}
