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
      return undefined;
    } else {
      return data;
    }
  }

  async registerCandidate(candidate: any): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabase.rpc('register_candidate', {
        p_full_name: candidate.fullName,
        p_email: candidate.email,
        p_mobile: candidate.mobile,
        p_userid: candidate.userId,
        p_createdby: candidate.createdBy,
        p_packagetypeid: candidate.packageTypeId,
        p_servicetypeid: candidate.serviceTypeId,
        p_personaltraining: candidate.admissionFee,
        p_total_amount: candidate.totalAmt,
        p_paid_amount: candidate.paidAmt,
        p_balance_amount: candidate.balanceAmt,
        p_admission_date: candidate.admissionDate,
        p_start_date: candidate.startDate,
        p_end_date: candidate.endDate,
        p_dob: candidate.dob
      });

      if (error) {
        console.error('RPC Error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Registration successful!' };
    } catch (err) {
      console.error('Unexpected Error:', err);
      return { success: false, message: 'Unexpected error occurred' };
    }
  }

  async fetchCandidatesByUserId(userId: number) {
    const { data, error } = await this.supabase
      .rpc('get_candidates_by_userid', { p_userid: userId });
  
    if (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  
    return data;
  }

  async getAllTemplates(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('messagetemplates')
      .select('*')
      .order('createdon', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return data || [];
  }

  async getGymLogoByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('gymlogo')
      .eq('userid', userId)
      .single();
  
    if (error) {
      console.error('Error fetching gymLogo:', error.message);
      return null;
    }
  
    return data?.gymlogo;
  }
}
