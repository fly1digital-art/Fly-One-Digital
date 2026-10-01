'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="wrap section"><h1>পাতাটি লোড করা যায়নি</h1><p>সাময়িক সংযোগের সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।</p><button className="btn" onClick={reset}>আবার চেষ্টা করুন</button></main>}
