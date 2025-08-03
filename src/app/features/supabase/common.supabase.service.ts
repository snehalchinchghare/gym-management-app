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

  async getPackageTypes() {
    const packageTypesRes = await this.supabase
      .from('packagetypes')
      .select('*')
      .order('packagetypeid', { ascending: true });
    return packageTypesRes.data || [];
  }

  async getServiceTypes() {
    const serviceTypesRes = await this.supabase
      .from('servicetypes')
      .select('*')
      .order('servicetypeid', { ascending: true });
    return serviceTypesRes.data || [];
  }

  async insertAdminUser(user: any) {
    return this.supabase.rpc('add_admin_user', user);
  }

  async updateAdminUser(user: any) {
    return this.supabase.rpc('update_admin_user', user);
  }

  async verifyAdminLogin(loginEmail: any, loginPassword: any) {
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

  async updateCandidate(data: {
    candidateId: number,
    userid: number,
    fullName: string,
    email: string,
    mobile: string,
    dob: string
  }) {
    const { error } = await this.supabase.rpc('update_candidate_details', {
      p_candidate_id: data.candidateId,
      p_userid: data.userid,
      p_full_name: data.fullName,
      p_email: data.email,
      p_mobile: data.mobile,
      p_dob: data.dob,
    });

    if (error) {
      console.error('❌ Supabase function error:', error.message);
      throw error;
    }

    return true;
  }


  async registerCandidate(candidate: any): Promise<{ candidateid: number; success: boolean; message: string }> {
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
        p_dob: candidate.dob,
        p_receipttype: 'New'
      });

      if (error) {
        console.error('RPC Error:', error);
        return { candidateid: 0, success: false, message: error.message };
      }

      return { candidateid: data, success: true, message: 'Registration successful!' };
    } catch (err) {
      console.error('Unexpected Error:', err);
      return { candidateid: 0, success: false, message: 'Unexpected error occurred' };
    }
  }

  async fetchCandidatesByUserIdOrSearchText(userId: number, searchText: string = '', currentPage: number = 1, pageSize: number = 2, isActive: boolean | null = null) {
    const { data, error } = await this.supabase.rpc('get_candidates_by_userid_searchterm', {
      p_userid: userId,
      p_search: searchText,
      p_offset: (currentPage - 1) * pageSize,
      p_limit: pageSize,
      p_isactive: isActive
    });

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

  async getCandidateDetailsById(candidateid: any, startdate: any = null, enddate: any = null) {
    const { data, error } = await this.supabase.rpc('get_candidate_details_by_id', {
      p_candidateid: candidateid,
      p_start_date: startdate,
      p_end_date: enddate
    });

    if (error) {
      console.error('Error fetching gymLogo:', error.message);
      return null;
    }

    return data;
  }

  logError(message: string, stack: string = '', context: any = {}) {
    return this.supabase
      .from('errors')
      .insert([{ message, stack, context }])
      .then(({ error }) => {
        if (error) {
          console.error('Supabase insert error:', error);
        }
      });
  }

  updateReceiptLink(registrationId: any, receiptLink: any) {
    return this.supabase
      .from('registrations')
      .update({ receiptlink: receiptLink })
      .eq('registrationid', registrationId)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error updating receipt link:', error);
        }
      });
  }

  async renewMembership(candidateid: any, candidate: any, receiptType: string): Promise<{ candidateid: number; success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabase.rpc('renew_membership', {
        p_candidateid: candidateid,
        p_full_name: candidate.fullName,
        p_email: candidate.email,
        p_mobile: candidate.mobile,
        p_dateofbirth: candidate.dob,
        p_updatedby: candidate.userId,

        p_packagetypeid: candidate.packageTypeId,
        p_servicetypeid: candidate.serviceTypeId,
        p_total_amount: candidate.totalAmt,
        p_paid_amount: candidate.paidAmt,
        p_balance_amount: candidate.balanceAmt,
        p_admission_date: candidate.admissionDate,
        p_start_date: candidate.startDate,
        p_end_date: candidate.endDate,
        p_admissionfee: candidate.admissionFee,
        p_createdby: candidate.userId,
        p_receipttype: receiptType
      });

      if (error) {
        console.error('RPC Error:', error);
        return { candidateid: 0, success: false, message: error.message };
      }

      return { candidateid: data, success: true, message: 'Registration successful!' };
    } catch (err) {
      console.error('Unexpected Error:', err);
      return { candidateid: 0, success: false, message: 'Unexpected error occurred' };
    }
  }

  async getCandidateForRenewal(candidateid: number | null) {
    const { data, error } = await this.supabase
      .rpc('get_candidate_by_id', {
        p_candidateid: candidateid,
        p_start_date: null,
        p_end_date: null
      });

    if (error) {
      console.error('Error fetching candidate data:', error);
    } else {
      return data[0];
    }
  }

  async getCandidateWithRegistrations(candidateId: number): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_candidate_with_registrations', { p_candidateid: candidateId });

    if (error) {
      console.error('Error fetching candidate with registrations:', error);
      throw error;
    }

    return data;
  }

  async getPlans(): Promise<any> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .order('planid', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
    } else {
      return data;
    }
  }

  async getFeatures(): Promise<any> {
    const { data, error } = await this.supabase
      .from('features')
      .select('*')
      .order('featureid', { ascending: true });

    if (error) {
      console.error('Error fetching features:', error);
    } else {
      return data;
    }
  }

  async updateCandidateStatusByUserId(candidateid: number, isActive: boolean) {
    const { data, error } = await this.supabase
      .from('candidates')
      .update({ isactive: isActive })  // 👈 column to update
      .eq('candidateid', candidateid);           // 👈 filtering by userid

    if (error) {
      console.error('Error updating candidate:', error);
      return null;
    }

    return data;
  }

  async loadMonthlyRevenueChart(fromDate: Date, toDate: Date) {
    let dates = this.getFormattedDateForChart(fromDate, toDate);

    const { data, error } = await this.supabase
      .from('registrations')
      .select('start_date, paid_amount')
      .gte('start_date', dates.fromDateStr)
      .lte('start_date', dates.toDateStr)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return {};
    }

    if (!data) {
      console.warn('No data received from Supabase');
      return {};
    }
    
    const grouped: { [month: string]: number } = {};
    data.forEach(row => {
      const month = new Date(row.start_date).toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });
      grouped[month] = (grouped[month] || 0) + Number(row.paid_amount);
    });
    return grouped;

  }

  async loadPackageDistributionChart(fromDate: Date, toDate: Date) {
    let dates = this.getFormattedDateForChart(fromDate, toDate);
    let packageTypes = await this.getPackageTypes();
    const { data } = await this.supabase
      .from('registrations')
      .select('packagetypeid, paid_amount')
      .gte('start_date', dates.fromDateStr)
      .lte('start_date', dates.toDateStr)
      .order('start_date', { ascending: true });

    const grouped: { [packageType: string]: number } = {};
    data?.forEach(row => {
      const key = packageTypes.find(p => p.packagetypeid == row.packagetypeid).packagename;
      grouped[key] = (grouped[key] || 0) + Number(row.paid_amount);
    });

    return grouped;
  }

  async loadServiceDistributionChart(fromDate: Date, toDate: Date) {
    let dates = this.getFormattedDateForChart(fromDate, toDate);
    let serviceTypes = await this.getServiceTypes();
    const { data } = await this.supabase
      .from('registrations')
      .select('servicetypeid, paid_amount')
      .gte('start_date', dates.fromDateStr)
      .lte('start_date', dates.toDateStr)
      .order('start_date', { ascending: true });

    const grouped: { [service: string]: number } = {};
    data?.forEach(row => {
      const key = serviceTypes.find(p => p.servicetypeid == row.servicetypeid).servicename;
      grouped[key] = (grouped[key] || 0) + Number(row.paid_amount);
    });
    return grouped;
  }

  getFormattedDateForChart(fromDate: Date, toDate: Date){
    const fromDateConverted = new Date(fromDate);
    const toDateConverted = new Date(toDate);
    
    const fromDate1 = new Date(fromDateConverted.getFullYear(), fromDateConverted.getMonth(), 1); // Start of month 2 months ago
    const toDate1 = new Date(toDateConverted.getFullYear(), toDateConverted.getMonth() + 1, 0);   // End of current month

    const fromDateStr = fromDate1.toISOString().split('T')[0];
    const toDateStr = toDate1.toISOString().split('T')[0];

    return { fromDateStr, toDateStr};
  }
}
