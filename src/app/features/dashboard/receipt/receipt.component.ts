import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import html2canvas from "html2canvas";
import { SupabaseService } from "../../supabase/common.supabase.service";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import jsPDF from 'jspdf';

@Component({
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    standalone: true,
    selector: 'app-receipt',
    templateUrl: './receipt.component.html',
  })
  export class ReceiptComponent {
  candidateId!: number;
  receiptType!: string;
  startDate: any = null;
  endDate: any = null;
  candidateData: any;
  dataLoaded: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private supabaseService: SupabaseService) {}
    
  async ngOnInit() {
    this.dataLoaded = false;
    this.route.paramMap.subscribe(params => {
      const encoded = params.get('data');
      if (encoded) {
        const decoded = JSON.parse(atob(encoded));
        this.candidateId = decoded.candidateId;
        this.receiptType = decoded.receiptType;
        this.startDate = decoded.startDate;
        this.endDate = decoded.endDate;
      }
    });
    
    let candidates = await this.supabaseService.getCandidateDetailsById(this.candidateId);
    if(candidates){
      this.candidateData = candidates[0];
      this.receiptType = this.candidateData.receipttype;
      setTimeout(() => {
        this.dataLoaded = true;        
      }, 500); 
    }
  }

  generatePDF() {
    const element = document.getElementById('print-section');
    if (element) {
      element.style.width = '800px';
      element.style.transform = 'scale(1)';
      element.style.transformOrigin = 'top left';
    
      html2canvas(element, {
        scale: 2,
        width: 800
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('receipt.pdf');
      });
    }
    
  }

  formatDate(date: any): String {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  numberToWordsIndian(num: number): string {
    if (num === 0) return 'Zero Rupees';
  
    const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['Crore', 'Lakh', 'Thousand', 'Hundred'];
  
    const getTwoDigit = (n: number): string => {
      if (n < 10) return singleDigits[n];
      if (n >= 10 && n < 20) return teens[n - 10];
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singleDigits[n % 10] : '');
    };
  
    let result = '';
    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    let hundred = Math.floor(num / 100);
    num %= 100;
  
    if (crore) result += getTwoDigit(crore) + ' Crore ';
    if (lakh) result += getTwoDigit(lakh) + ' Lakh ';
    if (thousand) result += getTwoDigit(thousand) + ' Thousand ';
    if (hundred) result += singleDigits[hundred] + ' Hundred ';
    if (num) result += (result !== '' ? 'and ' : '') + getTwoDigit(num) + ' ';
  
    return result.trim() + ' Rupees Only';
  }
  
  }