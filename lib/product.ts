export const PRODUCT = { id: 'F-06', name: 'Glasses Wireless headset', regular: 1199, price: 799, delivery: { bangladesh: 130 }, phone: '+8801323527412', whatsapp: 'https://wa.me/8801323527412', facebook: 'https://www.facebook.com/99fay/' } as const;
export const money = (n: number) => '৳' + new Intl.NumberFormat('bn-BD').format(n);
export const normalizePhone = (v: string) => v.replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[\s-]/g, '');
export const statuses: Record<string,string> = { received:'অর্ডার গৃহীত', confirmed:'অর্ডার নিশ্চিত', shipped:'পাঠানো হয়েছে', delivered:'ডেলিভারি সম্পন্ন', cancelled:'বাতিল' };
export type OrderSummary = { reference:string; createdAt:string; updatedAt:string; status:string; paymentStatus:string; area:'bangladesh'|'dhaka'|'outside'; subtotal:number; delivery:number; total:number; quantity:number; demo:boolean; };
export type SavedOrder = OrderSummary & { token:string; syncedAt:string };
export type PublicConfig = { mode:'live'|'demo'; pixelId:string; };
export type OrderInput = { name:string; email:string; phone:string; address:string; area:string };
export function validateOrder(input:OrderInput){
 const errors:Record<string,string>={};
 if(input.name.trim().length<2 || input.name.trim().length>100) errors.name='আপনার সম্পূর্ণ নাম লিখুন (২–১০০ অক্ষর)।';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.trim().length>254) errors.email='সঠিক ইমেইল ঠিকানা লিখুন।';
 if(!/^01[3-9]\d{8}$/.test(normalizePhone(input.phone))) errors.phone='সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন।';
 if(input.address.trim().length<15 || input.address.trim().length>600) errors.address='বাসা, এলাকা, থানা ও জেলাসহ বিস্তারিত ঠিকানা লিখুন (১৫–৬০০ অক্ষর)।';
 if(!['bangladesh','dhaka','outside'].includes(input.area)) errors.area='আপনার ডেলিভারি এলাকা নির্বাচন করুন।';
 return errors;
}
export function cleanCampaign(value: unknown){const result:Record<string,string>={};if(!value||typeof value!=='object')return result;for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const raw=(value as Record<string,unknown>)[key];if(typeof raw==='string'){const v=raw.replace(/[^\p{L}\p{N} _.,:()\-]/gu,'').slice(0,120);if(v)result[key]=v;}}return result;}
